import { userRepository } from '@/repositories/user.repository';
import { authService } from './auth.service';
import { NotFoundError, ValidationError, AuthError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export const userService = {
  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    logger.info('UserService', `Updating profile for ${userId}`);

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');

    if (data.email && data.email !== user.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== userId) {
        throw new ValidationError('Email address is already in use');
      }
    }

    return userRepository.updateProfile(userId, data);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    logger.info('UserService', `Changing password for ${userId}`);

    const user = await userRepository.findByEmail(
      (await userRepository.findById(userId))?.email ?? ''
    );
    if (!user || !user.password) throw new NotFoundError('User');

    const isValid = await authService.verifyPassword(currentPassword, user.password);
    if (!isValid) throw new AuthError('Current password is incorrect');

    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters');
    }

    const hashedPassword = await authService.hashPassword(newPassword);
    await userRepository.updatePassword(userId, hashedPassword);

    logger.info('UserService', `Password changed successfully for ${userId}`);
  },
};
