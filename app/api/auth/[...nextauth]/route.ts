import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authService } from '@/services/auth.service';
import { logger } from '@/lib/logger';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // ── Demo user short-circuit (no DB required) ──────────────────
        const DEMO_EMAIL = 'demo@clv.com';
        const DEMO_PASSWORD = 'demo123';
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          logger.info('NextAuth', 'Demo user login');
          return {
            id: 'demo-user-id',
            email: DEMO_EMAIL,
            name: 'Demo User',
            role: 'demo',
          };
        }
        // ─────────────────────────────────────────────────────────────

        // Regular DB-backed login (only runs if DB is configured)
        try {
          await authService.ensureDemoUser();
          const user = await authService.validateCredentials(email, password);
          if (!user) {
            logger.warn('NextAuth', `Failed login attempt for ${email}`);
            throw new Error('Invalid email or password');
          }
          logger.info('NextAuth', `Successful login: ${email}`);
          return user;
        } catch (err: any) {
          // If the error is a DB connection error, give a clear message
          if (
            err?.message?.includes('POSTGRES_PRISMA_URL') ||
            err?.message?.includes('Environment variable not found') ||
            err?.message?.includes('P1001') // Prisma "Can't reach database server"
          ) {
            logger.warn('NextAuth', 'No DB configured — only demo login available');
            throw new Error('Database not configured. Use demo@clv.com / demo123 to explore.');
          }
          throw err;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as any).role ?? 'user';
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'clv-predict-super-secret-change-in-production',
});

export const { GET, POST } = handlers;
