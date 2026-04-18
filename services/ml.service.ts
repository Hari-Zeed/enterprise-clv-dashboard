import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/logger';
import { MLError } from '@/lib/errors';
import { modelRepository } from '@/repositories/model.repository';
import type { MLTrainingResult, MLPredictionResult, PredictionInput } from '@/types/ml';

const PYTHON_CMD = path.join(process.cwd(), '.venv', 'bin', 'python');
const SCRIPT_DIR = path.join(process.cwd(), 'scripts', 'ml');
const TIMEOUT_MS_TRAIN = 360_000; // 6 minutes for training (hyperopt can be slow)
const DAEMON_TIMEOUT_MS = 60_000; // 60 seconds for predictions

// ─── Pending request tracker ────────────────────────────────────────────────
interface DaemonRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timer: NodeJS.Timeout;
}

// ─── Python Prediction Daemon (singleton) ────────────────────────────────────
class PredictDaemon {
  private static instance: PredictDaemon;
  private process: ChildProcess | null = null;
  private isReady = false;
  private pendingRequests = new Map<string, DaemonRequest>();
  private bootRetries = 0;

  private constructor() {
    this.boot();
  }

  public static getInstance(): PredictDaemon {
    if (!PredictDaemon.instance) {
      PredictDaemon.instance = new PredictDaemon();
    }
    return PredictDaemon.instance;
  }

  private boot() {
    logger.info('MLDaemon', 'Booting Python Prediction Daemon...');
    const scriptPath = path.join(SCRIPT_DIR, 'predict.py');

    try {
      this.process = spawn(PYTHON_CMD, [scriptPath], {
        cwd: process.cwd(), // ensure relative paths in predict.py resolve correctly
      });
    } catch (err) {
      logger.error('MLDaemon', 'Failed to spawn Python daemon', err);
      return;
    }

    this.isReady = false;
    let stdoutBuffer = '';

    this.process.stdout?.on('data', (chunk: Buffer) => {
      stdoutBuffer += chunk.toString();
      let newlineIdx;
      while ((newlineIdx = stdoutBuffer.indexOf('\n')) >= 0) {
        const line = stdoutBuffer.substring(0, newlineIdx).trim();
        stdoutBuffer = stdoutBuffer.substring(newlineIdx + 1);
        if (!line) continue;
        try {
          const data = JSON.parse(line);
          if (data.system === 'ready') {
            logger.info('MLDaemon', 'Python Daemon ready');
            this.isReady = true;
            this.bootRetries = 0;
            continue;
          }
          const reqId = data.reqId;
          if (reqId && this.pendingRequests.has(reqId)) {
            const req = this.pendingRequests.get(reqId)!;
            clearTimeout(req.timer);
            if (data.success) {
              req.resolve(data);
            } else {
              req.reject(new MLError(data.error || 'Daemon prediction error'));
            }
            this.pendingRequests.delete(reqId);
          }
        } catch {
          logger.warn('MLDaemon', 'Failed to parse stdout line', { line: line.substring(0, 200) });
        }
      }
    });

    this.process.stderr?.on('data', (chunk: Buffer) => {
      logger.warn('MLDaemon', 'Daemon stderr', { msg: chunk.toString().trim().substring(0, 300) });
    });

    this.process.on('close', (code) => {
      logger.error('MLDaemon', `Daemon exited (code: ${code}). Retrying...`);
      this.isReady = false;
      this.rejectAll('Python daemon crashed and is rebooting. Please retry.');
      this.bootRetries++;
      const delay = Math.min(1000 * this.bootRetries, 10000);
      setTimeout(() => this.boot(), delay);
    });

    this.process.on('error', (err) => {
      logger.error('MLDaemon', 'Process error', err);
      this.isReady = false;
    });
  }

  private rejectAll(reason: string) {
    for (const [, req] of this.pendingRequests.entries()) {
      clearTimeout(req.timer);
      req.reject(new MLError(reason));
    }
    this.pendingRequests.clear();
  }

  public get ready(): boolean {
    return this.isReady;
  }

  public async schedulePrediction(datasetId: string, modelData: PredictionInput[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.isReady) {
        return reject(
          new MLError('Prediction service is warming up. Please try again in a few seconds.')
        );
      }

      const reqId = randomUUID();
      const timer = setTimeout(() => {
        this.pendingRequests.delete(reqId);
        reject(new MLError(`Prediction timed out after ${DAEMON_TIMEOUT_MS / 1000}s`));
      }, DAEMON_TIMEOUT_MS);

      this.pendingRequests.set(reqId, { resolve, reject, timer });

      try {
        const payload = JSON.stringify({ reqId, dataset_id: datasetId, data: modelData });
        this.process!.stdin?.write(payload + '\n');
      } catch (e: any) {
        clearTimeout(timer);
        this.pendingRequests.delete(reqId);
        reject(new MLError(`Failed to send data to prediction daemon: ${e.message}`));
      }
    });
  }
}

// ─── Isolated script runner (for training) ──────────────────────────────────
function runIsolatedScript<T>(
  scriptName: string,
  payload: Record<string, unknown>,
  timeoutMs: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SCRIPT_DIR, scriptName);
    const pythonProcess = spawn(PYTHON_CMD, [scriptPath], {
      cwd: process.cwd(),
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      pythonProcess.kill('SIGTERM');
      reject(new MLError(`Python script "${scriptName}" timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    pythonProcess.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        const errMsg = stderr.substring(0, 500) || `Exit code ${code}`;
        logger.error('MLService', `Script ${scriptName} failed`, { code, stderr: errMsg });
        reject(new MLError(`Python training failed: ${errMsg}`));
        return;
      }
      // Extract the last JSON line from stdout (training logs go to stderr via logging module)
      const lines = stdout.trim().split('\n').filter(Boolean);
      const jsonLine = lines[lines.length - 1];
      try {
        const result = JSON.parse(jsonLine) as T;
        resolve(result);
      } catch {
        logger.error('MLService', `Bad JSON from ${scriptName}`, { stdout: stdout.substring(0, 300) });
        reject(new MLError(`Invalid JSON output from training script`));
      }
    });

    pythonProcess.on('error', (err) => {
      clearTimeout(timer);
      logger.error('MLService', `Failed to start ${scriptName}`, err);
      reject(new MLError(`Could not start Python: ${err.message}. Is .venv installed?`));
    });

    // Send payload via stdin
    pythonProcess.stdin.write(JSON.stringify(payload));
    pythonProcess.stdin.end();
  });
}

// ─── Singleton daemon instance ───────────────────────────────────────────────
const daemon = PredictDaemon.getInstance();

// ─── Exported ML Service ─────────────────────────────────────────────────────
export const mlService = {
  /**
   * Train model and save ModelMetadata to DB.
   * Returns training result including metrics and the new model's DB id.
   */
  async trainModelAndSaveVersion(
    userId: string,
    datasetId: string,
    data: PredictionInput[]
  ) {
    logger.info('MLService', `Training ${data.length} records for dataset ${datasetId}`);

    type TrainResult = {
      success: boolean;
      error?: string;
      metrics?: {
        train_r2: number;
        test_r2: number;
        rmse: number;
        mae: number;
        cv_score: number;
        best_params?: Record<string, unknown>;
      };
      model_info?: {
        model_path: string;
        scaler_path: string;
        imputer_path: string;
        features_used: string[];
      };
      data_shape?: number[];
    };

    const result = await runIsolatedScript<TrainResult>(
      'train_model.py',
      { data, dataset_id: datasetId },
      TIMEOUT_MS_TRAIN
    );

    if (!result.success) {
      throw new MLError(result.error ?? 'Training script returned failure');
    }

    logger.info('MLService', 'Training complete', result.metrics);

    // Archive any previously active model for this user
    const existingActive = await modelRepository.getActiveByUserId(userId);
    if (existingActive) {
      await modelRepository.update(existingActive.id, { status: 'archived' });
    }

    // Persist new model record
    const newModel = await modelRepository.create({
      userId,
      datasetId,
      name: `CLV XGBoost — ${new Date().toLocaleDateString()}`,
      modelType: 'xgboost-hyperopt',
      features: result.model_info?.features_used ?? [],
      accuracy: result.metrics?.test_r2,
      rmse: result.metrics?.rmse,
      mae: result.metrics?.mae,
      cvScore: result.metrics?.cv_score,
      modelPath: datasetId, // daemon loads from ./storage/models/{datasetId}
    });

    return { success: true, metrics: result.metrics, modelId: newModel.id, model_info: result.model_info };
  },

  /**
   * Convenience alias (uses 'default' as datasetId for one-off training).
   */
  async trainModel(data: PredictionInput[]): Promise<MLTrainingResult> {
    const result = await runIsolatedScript<MLTrainingResult>(
      'train_model.py',
      { data, dataset_id: 'default' },
      TIMEOUT_MS_TRAIN
    );
    return result;
  },

  /**
   * Run prediction for a user via the persistent daemon.
   * Resolves the active model from DB, falls back to 'default' model path if none.
   */
  async predict(userId: string, data: PredictionInput[]): Promise<MLPredictionResult> {
    logger.info('MLService', `Predicting ${data.length} records for user ${userId}`);

    // Look up active model in DB
    const activeModel = await modelRepository.getActiveByUserId(userId);

    // Determine which model directory to use
    let modelPath: string;
    if (activeModel?.modelPath) {
      modelPath = activeModel.modelPath;
    } else {
      // Fallback: check if a 'default' model exists on disk
      const fs = await import('fs');
      const defaultPath = path.join(process.cwd(), 'storage', 'models', 'default');
      if (fs.existsSync(path.join(defaultPath, 'xgboost_clv.pkl'))) {
        modelPath = 'default';
        logger.warn('MLService', 'No DB model found — using default model from disk');
      } else {
        throw new MLError(
          'No trained model found. Please upload a dataset to train the model first.'
        );
      }
    }

    const result = await daemon.schedulePrediction(modelPath, data);
    logger.info('MLService', 'Prediction complete');
    return result as MLPredictionResult;
  },
};
