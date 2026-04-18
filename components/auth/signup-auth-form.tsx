'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { FloatingLabelInput } from './floating-label-input';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupAuthForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password, name: data.name }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Registration failed');
        return;
      }

      toast.success('Account created successfully! Redirecting...', { icon: '✨' });
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch (error) {
      toast.error('An error occurred during registration');
      console.error(error);
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
          name="name"
          control={control}
          render={({ field }) => (
            <FloatingLabelInput
              {...field}
              label="Full Name"
              type="text"
              icon={<User className="w-5 h-5" />}
              error={errors.name?.message}
              disabled={isLoading}
              autoComplete="name"
            />
          )}
        />
      </motion.div>

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

      <motion.div variants={itemVariants}>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <div className="space-y-1">
              <FloatingLabelInput
                {...field}
                label="Password"
                type="password"
                icon={<Lock className="w-5 h-5" />}
                error={errors.password?.message}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <AnimatePresence>
                {/* Visual password requirements can go here if needed, but Zod errors handle the text */}
              </AnimatePresence>
            </div>
          )}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <FloatingLabelInput
              {...field}
              label="Confirm Password"
              type="password"
              icon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword?.message}
              disabled={isLoading}
              autoComplete="new-password"
            />
          )}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="pt-4">
        <Button
          type="submit"
          size="lg"
          className="w-full h-12 shadow-md relative overflow-hidden group"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              Create Account <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}
