import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input, InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FloatingLabelInputProps extends InputProps {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, type, label, error, icon, required, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    // Check if there is a value; this logic assumes value is controlled or defaultValue is passed,
    // but typically for uncontrolled inputs, checking `props.value` works or `e.target.value` via internal state.
    // However, react-hook-form provides value, so checking props.value or props.defaultValue is key.
    const hasValue = props.value !== undefined && props.value !== '' && props.value !== null;
    const isError = !!error;

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="relative w-full group">
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 transition-colors group-focus-within:text-primary">
              {icon}
            </div>
          )}
          
          <Input
            type={inputType}
            ref={ref}
            disabled={disabled}
            className={cn(
              "h-14 px-4 pt-4 pb-1 transition-all duration-200 border bg-background/50 backdrop-blur-sm peer placeholder:text-transparent",
              icon && "pl-10",
              isError && "border-destructive focus-visible:ring-destructive/20",
              className
            )}
            placeholder={label}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          <Label
            className={cn(
              "absolute text-sm transition-all duration-200 pointer-events-none text-muted-foreground",
              icon ? "left-10" : "left-4",
              "top-2 text-[10px] uppercase tracking-wider font-semibold opacity-70",
              "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:opacity-100",
              "peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[10px] peer-focus:uppercase peer-focus:opacity-70 peer-focus:text-primary",
              (hasValue || isFocused) && "top-2 -translate-y-0 text-[10px] uppercase opacity-70 text-primary",
              isError && "text-destructive peer-focus:text-destructive"
            )}
          >
            {label} {required && <span className="text-destructive">*</span>}
          </Label>

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={disabled}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-destructive mt-1.5 font-medium ml-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FloatingLabelInput.displayName = 'FloatingLabelInput';
