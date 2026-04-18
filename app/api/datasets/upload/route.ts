import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { datasetService } from '@/services/dataset.service';
import { mlService } from '@/services/ml.service';
import { datasetRepository } from '@/repositories/dataset.repository';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as any).id as string;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return errorResponse('No file provided', 400);
    if (!file.name.endsWith('.csv')) return errorResponse('Only CSV files are supported', 400);
    if (file.size > 50 * 1024 * 1024) return errorResponse('File must be under 50MB', 400);

    const csvText = await file.text();

    // Demo mode — return mock success
    if (userId === 'demo-user-id' || (session.user as any).role === 'demo') {
      return successResponse(
        { dataset: { id: 'demo-upload', name: file.name, status: 'success' }, message: 'Dataset uploaded (demo mode).' },
        201
      );
    }

    // Validate & store dataset
    const dataset = await datasetService.uploadDataset(userId, file.name, file.size, csvText);
    logger.info('UploadController', `Dataset stored: ${dataset.id}`, { userId });

    // ── BACKGROUND: Parse all rows → train model ──────────────────────────────
    // We respond immediately and train in a detached async block.
    setImmediate(async () => {
      try {
        await datasetRepository.updateStatus(dataset.id, 'training');

        const records = datasetService.parseAllRowsToPredictionInput(csvText);
        if (records.length < 5) {
          await datasetRepository.updateStatus(dataset.id, 'error', 'Dataset too small — need at least 5 valid rows');
          return;
        }

        logger.info('UploadController', `Starting background training for ${dataset.id} with ${records.length} records`);

        const result = await mlService.trainModelAndSaveVersion(userId, dataset.id, records);

        // Save real metrics back to dataset row
        if (result.metrics) {
          await datasetRepository.updateTrainingMetrics(dataset.id, {
            trainR2: result.metrics.test_r2 ?? 0,
            trainRmse: result.metrics.rmse ?? 0,
            trainMae: result.metrics.mae ?? 0,
          });
        } else {
          await datasetRepository.updateStatus(dataset.id, 'success');
        }

        logger.info('UploadController', `Training complete for ${dataset.id}`, result.metrics);
      } catch (err: any) {
        logger.error('UploadController', `Training failed for ${dataset.id}`, err);
        await datasetRepository.updateStatus(
          dataset.id,
          'error',
          err?.message ?? 'Training failed'
        );
      }
    });
    // ─────────────────────────────────────────────────────────────────────────

    return successResponse(
      {
        dataset: {
          id: dataset.id,
          name: dataset.name,
          rowCount: dataset.rowCount,
          status: dataset.status,
        },
        message: 'Dataset uploaded. Training started in background.',
      },
      201
    );
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    if (error.statusCode) return errorResponse(error.message ?? 'Error', error.statusCode);
    logger.error('UploadController', 'Upload error', err);
    return errorResponse('Internal server error', 500);
  }
}
