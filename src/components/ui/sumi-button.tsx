import React from 'react';
import { cn } from '@/lib/utils';

interface SumiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  withInkEffect?: boolean;
}

export const SumiButton = React.forwardRef<HTMLButtonElement, SumiButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    withInkEffect = false,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-medium rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95 transform'
    ].join(' ');

    const variantClasses = {
      primary: [
        'bg-sumi-ink-800 text-sumi-cream-50',
        'hover:bg-sumi-ink-700 focus:ring-sumi-ink-500',
        'border border-sumi-ink-600 shadow-sm',
        'dark:bg-sumi-ink-100 dark:text-sumi-ink-900',
        'dark:hover:bg-sumi-ink-50 dark:border-sumi-ink-200'
      ].join(' '),
      
      accent: [
        'bg-sumi-gold-500 text-sumi-ink-900',
        'hover:bg-sumi-gold-400 focus:ring-sumi-gold-300',
        'border border-sumi-gold-400 shadow-sm',
        'dark:bg-sumi-gold-400 dark:hover:bg-sumi-gold-300'
      ].join(' '),
      
      ghost: [
        'bg-transparent text-foreground',
        'hover:bg-muted focus:ring-accent/30',
        'border border-transparent'
      ].join(' '),
      
      outline: [
        'bg-transparent text-foreground',
        'hover:bg-muted focus:ring-accent/30',
        'border border-border'
      ].join(' ')
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          withInkEffect && 'ink-container overflow-hidden',
          disabled && 'pointer-events-none',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SumiButton.displayName = 'SumiButton';

interface SumiIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline';
}

export const SumiIconButton = React.forwardRef<HTMLButtonElement, SumiIconButtonProps>(
  ({
    children,
    className,
    size = 'md',
    variant = 'ghost',
    ...props
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center',
      'rounded-full transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95 transform'
    ].join(' ');

    const variantClasses = {
      ghost: 'hover:bg-muted focus:ring-accent/30',
      outline: 'border border-border hover:bg-muted focus:ring-accent/30'
    };

    const sizeClasses = {
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SumiIconButton.displayName = 'SumiIconButton';