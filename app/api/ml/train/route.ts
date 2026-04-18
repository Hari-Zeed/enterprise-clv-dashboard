import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { mlService } from '@/services/ml.service';
import { datasetService } from '@/services/dataset.service';
import { datasetRepository } from '@/repositories/dataset.repository';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const trainSchema = z.object({
  dataset_id: z.string().optional(),
  data: z
    .array(
      z.object({
        customer_id: z.string().optional(),
        recency: z.number().min(0),
        frequency: z.number().min(0),
        monetary_value: z.number(),
        tenure: z.number().min(0),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as any).id as string;

    const body = await request.json();
    const parsed = trainSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message ?? 'Invalid input', 400);
    }

    let { data, dataset_id } = parsed.data;

    // If dataset_id provided but no data, try to load from DB
    if (dataset_id && (!data || data.length === 0)) {
      const dataset = await datasetRepository.findById(dataset_id);
      if (!dataset) return errorResponse('Dataset not found', 404);
      data = datasetService.parseAllRowsToPredictionInput(dataset.csvData ?? '');
    }

    if (!data || data.length === 0) {
      return errorResponse('No training data provided', 400);
    }

    if (data.length < 5) {
      return errorResponse('Training requires at least 5 valid customer rows', 400);
    }

    logger.info('TrainController', `Starting training with ${data.length} records`, { userId, dataset_id });

    const effectiveDatasetId = dataset_id ?? 'default';
    const result = await mlService.trainModelAndSaveVersion(userId, effectiveDatasetId, data);

    if (!result.success) {
      return errorResponse((result as any).error ?? 'Training failed', 500);
    }

    // Update dataset status if we have a dataset_id
    if (dataset_id) {
      await datasetRepository.updateTrainingMetrics(dataset_id, {
        trainR2: result.metrics?.test_r2 ?? 0,
        trainRmse: result.metrics?.rmse ?? 0,
        trainMae: result.metrics?.mae ?? 0,
      });
    }

    return successResponse({
      success: true,
      metrics: result.metrics,
      modelId: result.modelId,
      message: 'Model trained successfully',
    });
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    if (error.statusCode) return errorResponse(error.message ?? 'Error', error.statusCode);
    logger.error('TrainController', 'Unhandled error', err);
    return errorResponse('Internal server error', 500);
  }
}
