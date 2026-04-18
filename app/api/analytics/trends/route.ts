import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { analyticsService } from '@/services/analytics.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { getMockAnalyticsTrends } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as any).id as string;

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') ?? '180', 10);

    if (userId === 'demo-user-id' || (session.user as any).role === 'demo') {
      return successResponse(getMockAnalyticsTrends());
    }

    const trends = await analyticsService.getAnalyticsTrends(userId, days);
    logger.info('AnalyticsController', 'Fetched trends', { userId, days });

    return successResponse(trends);
  } catch (err) {
    logger.error('AnalyticsController', 'Trends error', err);
    return errorResponse('Internal server error', 500);
  }
}
