import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { analyticsService } from '@/services/analytics.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { getMockDashboardKPIs } from '@/lib/mock-data';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as any).id as string;

    if (userId === 'demo-user-id' || (session.user as any).role === 'demo') {
      return successResponse(getMockDashboardKPIs());
    }

    const kpis = await analyticsService.getDashboardKPIs(userId);
    logger.info('AnalyticsController', 'Fetched dashboard KPIs', { userId });

    return successResponse(kpis);
  } catch (err) {
    logger.error('AnalyticsController', 'Dashboard KPIs error', err);
    return errorResponse('Internal server error', 500);
  }
}
