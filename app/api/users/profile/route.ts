import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { userService } from '@/services/user.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email').optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as any).id as string;

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message, 400);

    if (userId === 'demo-user-id' || (session.user as any).role === 'demo') {
      return successResponse({ id: userId, email: parsed.data.email || 'demo@clv.com', name: parsed.data.name || 'Demo User', role: 'demo' });
    }

    const updated = await userService.updateProfile(userId, parsed.data);
    logger.info('UsersController', `Profile updated: ${userId}`);

    return successResponse(updated);
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    if (error.statusCode) return errorResponse(error.message ?? 'Error', error.statusCode);
    logger.error('UsersController', 'Profile update error', err);
    return errorResponse('Internal server error', 500);
  }
}
