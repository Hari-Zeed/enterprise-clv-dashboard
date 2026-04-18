import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { analyticsService } from '@/services/analytics.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { getMockFullAnalytics } from '@/lib/mock-data';
import type { AnalyticsFilters } from '@/types/analytics';

/**
 * GET /api/analytics/segments
 *
 * Query params:
 *   days        number  (default 180)
 *   segment     string  (default 'all')
 *   minRevenue  number
 *   maxRevenue  number
 *   search      string  (customer id partial match)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as { id: string }).id;

    const { searchParams } = new URL(request.url);

    const filters: AnalyticsFilters = {
      days:       parseInt(searchParams.get('days') ?? '180', 10),
      segment:    searchParams.get('segment') ?? 'all',
      minRevenue: searchParams.has('minRevenue')
        ? parseFloat(searchParams.get('minRevenue')!)
        : undefined,
      maxRevenue: searchParams.has('maxRevenue')
        ? parseFloat(searchParams.get('maxRevenue')!)
        : undefined,
      search: searchParams.get('search') ?? undefined,
    };

    if (userId === 'demo-user-id' || (session.user as any).role === 'demo') {
      return successResponse(getMockFullAnalytics());
    }

    const data = await analyticsService.getFullAnalytics(userId, filters);
    logger.info('AnalyticsController', 'Fetched full BI analytics', { userId, filters });

    return successResponse(data);
  } catch (err) {
    logger.error('AnalyticsController', 'Full BI analytics error', err);
    return errorResponse('Internal server error', 500);
  }
}
