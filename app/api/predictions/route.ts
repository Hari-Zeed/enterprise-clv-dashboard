import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { predictionRepository } from '@/repositories/prediction.repository';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { getMockPredictions } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as any).id as string;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);

    if (userId === 'demo-user-id' || (session.user as any).role === 'demo') {
      return successResponse(getMockPredictions().slice(0, limit));
    }

    const predictions = await predictionRepository.findByUserId(userId, limit);
    logger.info('PredictionsController', `Fetched ${predictions.length} predictions`, { userId });

    return successResponse(predictions);
  } catch (err) {
    logger.error('PredictionsController', 'List error', err);
    return errorResponse('Internal server error', 500);
  }
}
