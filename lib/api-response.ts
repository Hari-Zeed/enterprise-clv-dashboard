import { NextResponse } from 'next/server';
import { AppError } from './errors';
import { logger } from './logger';

export function successResponse<T>(data: T, status = 200, message?: string): NextResponse {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Wraps an async API route handler with centralized error handling.
 * Catches AppError subclasses and maps them to correct HTTP status codes.
 */
export function withErrorHandler(
  handler: (req: Request, ctx?: unknown) => Promise<NextResponse>
) {
  return async (req: Request, ctx?: unknown): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof AppError) {
        logger.warn('API', `${err.code}: ${err.message}`);
        return errorResponse(err.message, err.statusCode);
      }
      logger.error('API', 'Unhandled error', err);
      return errorResponse('Internal server error', 500);
    }
  };
}
