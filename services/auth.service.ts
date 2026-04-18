import * as bcrypt from 'bcryptjs';
import { userRepository } from '@/repositories/user.repository';
import { logger } from '@/lib/logger';

const SALT_ROUNDS = 10;
const DEMO_EMAIL = 'demo@clv.com';
const DEMO_PASSWORD = 'demo123';
const DEMO_NAME = 'Demo User';

export const authService = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  },

  /**
   * Ensures the demo user exists in DB. Safe to call repeatedly — idempotent.
   */
  async ensureDemoUser(): Promise<void> {
    try {
      const existing = await userRepository.findByEmail(DEMO_EMAIL);
      if (!existing) {
        const hashedPassword = await authService.hashPassword(DEMO_PASSWORD);
        await userRepository.create({
          name: DEMO_NAME,
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          hashedPassword,
          role: 'demo',
        });
        logger.info('AuthService', 'Demo user created');
      }
    } catch (err) {
      logger.warn('AuthService', 'Could not ensure demo user', err);
    }
  },

  async validateCredentials(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password) return null;

    const isValid = await authService.verifyPassword(password, user.password);
    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email ?? '',
      name: user.name ?? '',
      role: user.role,
    };
  },
};
