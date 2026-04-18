import { spawn } from 'child_process';
import path from 'path';

export interface MLTrainingResult {
  success: boolean;
  metrics?: {
    train_r2: number;
    test_r2: number;
    rmse: number;
    mae: number;
    best_params: Record<string, any>;
    cv_score: number;
  };
  data_shape?: number[];
  error?: string;
}

export interface MLPredictionResult {
  success: boolean;
  predictions?: Array<{
    clv: number;
    confidence: number;
    segment: string;
    customer_id: string;
  }>;
  summary?: {
    total_predictions: number;
    avg_clv: number;
    std_clv: number;
    min_clv: number;
    max_clv: number;
  };
  error?: string;
}

export async function trainModel(data: Record<string, any>[]): Promise<MLTrainingResult> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      path.join(process.cwd(), 'scripts/ml/train_model.py'),
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('[ML Service] Python stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('[ML Service] Training failed with code:', code);
        console.error('[ML Service] Error output:', errorOutput);
        reject(new Error(`Python process exited with code ${code}`));
        return;
      }

      try {
        const result = JSON.parse(output) as MLTrainingResult;
        resolve(result);
      } catch (error) {
        console.error('[ML Service] Failed to parse output:', output);
        reject(error);
      }
    });

    // Send data to Python process
    const inputData = JSON.stringify({ data });
    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();
  });
}

export async function makePredictions(data: Record<string, any>[]): Promise<MLPredictionResult> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      path.join(process.cwd(), 'scripts/ml/predict.py'),
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('[ML Service] Python stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('[ML Service] Prediction failed with code:', code);
        console.error('[ML Service] Error output:', errorOutput);
        reject(new Error(`Python process exited with code ${code}`));
        return;
      }

      try {
        const result = JSON.parse(output) as MLPredictionResult;
        resolve(result);
      } catch (error) {
        console.error('[ML Service] Failed to parse output:', output);
        reject(error);
      }
    });

    // Send data to Python process
    const inputData = JSON.stringify({ data });
    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();
  });
}
