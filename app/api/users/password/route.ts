import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { userService } from '@/services/user.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse('Unauthorized', 401);
    const userId = (session.user as any).id as string;

    const body = await request.json();
    const parsed = passwordSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message, 400);

    if (userId === 'demo-user-id' || (session.user as any).role === 'demo') {
      return successResponse({ message: 'Password updated successfully (Demo)' });
    }

    await userService.changePassword(userId, parsed.data.currentPassword, parsed.data.newPassword);
    logger.info('UsersController', `Password changed: ${userId}`);

    return successResponse({ message: 'Password updated successfully' });
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    if (error.statusCode) return errorResponse(error.message ?? 'Error', error.statusCode);
    logger.error('UsersController', 'Password change error', err);
    return errorResponse('Internal server error', 500);
  }
}
