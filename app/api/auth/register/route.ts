import { NextRequest } from 'next/server';
import { z } from 'zod';
import { userRepository } from '@/repositories/user.repository';
import { authService } from '@/services/auth.service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ConflictError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const { name, email, password } = parsed.data;

    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ConflictError('An account with this email already exists');

    const hashedPassword = await authService.hashPassword(password);
    const user = await userRepository.create({ name, email, password, hashedPassword });

    logger.info('RegisterController', `New user registered: ${email}`);
    return successResponse({ id: user.id, email: user.email, name: user.name }, 201);
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    if (error.statusCode) {
      return errorResponse(error.message ?? 'Error', error.statusCode);
    }
    const errorMsg = (err as any)?.message || '';
    if (
      errorMsg.includes('POSTGRES_PRISMA_URL') ||
      errorMsg.includes('Environment variable not found') ||
      errorMsg.includes('P1001')
    ) {
      return errorResponse('Database not configured. Use the Demo Login to explore!', 400);
    }

    logger.error('RegisterController', 'Unhandled error', err);
    return errorResponse('Internal server error', 500);
  }
}
