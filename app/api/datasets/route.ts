import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { datasetRepository } from '@/repositories/dataset.repository';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { getMockDatasets } from '@/lib/mock-data';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as any).id as string;

    if (userId === 'demo-user-id' || (session.user as any).role === 'demo') {
      return successResponse(getMockDatasets());
    }

    const datasets = await datasetRepository.findByUserId(userId);
    logger.info('DatasetsController', `Listed ${datasets.length} datasets`, { userId });

    return successResponse(datasets);
  } catch (err) {
    logger.error('DatasetsController', 'List error', err);
    return errorResponse('Internal server error', 500);
  }
}
