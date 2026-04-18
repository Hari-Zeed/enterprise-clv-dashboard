'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';
import { FloatingLabelInput } from './floating-label-input';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginAuthForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Surface meaningful error messages from the server
        const msg = result.error.includes('Database not configured')
          ? result.error
          : 'Invalid email or password';
        toast.error(msg);
      } else if (result?.ok) {
        toast.success('Welcome back!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error('An error occurred during sign in');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: 'demo@clv.com',
        password: 'demo123',
        redirect: false,
      });
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success('Welcome, Demo User! 🎉');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-5"
    >
      <motion.div variants={itemVariants}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FloatingLabelInput
              {...field}
              label="Email Address"
              type="email"
              icon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              disabled={isLoading}
              autoComplete="email"
            />
          )}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1">
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <FloatingLabelInput
              {...field}
              label="Password"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              disabled={isLoading}
              autoComplete="current-password"
            />
          )}
        />
        <div className="flex items-center justify-between mt-2 pt-1 px-1">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input type="checkbox" className="rounded border-border text-primary focus:ring-primary/50 cursor-pointer h-4 w-4 bg-background transition-all group-hover:border-primary/50" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors select-none">Remember me</span>
          </label>
          <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Forgot password?
          </a>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-2 gap-3 flex flex-col">
        <Button
          type="submit"
          size="lg"
          className="w-full h-12 shadow-md relative overflow-hidden group"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span className="flex items-center gap-2">
                Sign In <LogIn className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </span>
            </>
          )}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-3 bg-background text-muted-foreground font-medium">Or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full h-12 bg-secondary/30 hover:bg-secondary/50 border-border/50 text-foreground transition-colors"
          onClick={handleDemoLogin}
          disabled={isLoading}
        >
          Sign in as Demo User
        </Button>
      </motion.div>
    </motion.form>
  );
}
