import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { datasetRepository } from '@/repositories/dataset.repository';
import { modelRepository } from '@/repositories/model.repository';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as any).id as string;

    const dataset = await datasetRepository.findById(params.id);
    if (!dataset) return errorResponse('Dataset not found', 404);

    // Security: only owner can access
    if ((dataset as any).userId !== userId) {
      return errorResponse('Forbidden', 403);
    }

    // If training completed, also fetch model info
    let modelDetails: object | null = null;
    if ((dataset as any).status === 'success') {
      const model = await modelRepository.getActiveByUserId(userId);
      if (model) {
        modelDetails = {
          version: model.version,
          accuracy: model.accuracy,
          rmse: model.rmse,
          mae: model.mae,
          cvScore: model.cvScore,
          features: model.features,
          updatedAt: model.updatedAt,
        };
      }
    }

    const ds = dataset as any;
    return successResponse({
      id: ds.id,
      name: ds.name,
      fileName: ds.fileName,
      rowCount: ds.rowCount,
      status: ds.status,
      errorMessage: ds.errorMessage,
      trainR2: ds.trainR2,
      trainRmse: ds.trainRmse,
      trainMae: ds.trainMae,
      modelDetails,
      createdAt: ds.createdAt,
      updatedAt: ds.updatedAt,
    });
  } catch (err) {
    logger.error('DatasetController', 'Get dataset error', err);
    return errorResponse('Internal server error', 500);
  }
}
