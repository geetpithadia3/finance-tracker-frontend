import React from 'react';
import { cn } from '@/lib/utils';

interface SumiCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass';
  withInkFlow?: boolean;
}

export const SumiCard: React.FC<SumiCardProps> = ({
  children,
  className,
  variant = 'default',
  withInkFlow = false
}) => {
  const baseClasses = 'bg-card text-card-foreground rounded-2xl border transition-all duration-300';
  
  const variantClasses = {
    default: 'border-border/50 shadow-sumi hover:shadow-sumi-lg',
    elevated: 'border-border/30 shadow-sumi-lg hover:shadow-xl backdrop-blur-sm',
    glass: 'bg-card/80 border-border/20 backdrop-blur-md shadow-sumi'
  };

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        withInkFlow && 'ink-container',
        'group',
        className
      )}
    >
      {children}
    </div>
  );
};

interface SumiCardHeaderProps {
  children: React.ReactNode;
  className?: string;
  withBrushStroke?: boolean;
}

export const SumiCardHeader: React.FC<SumiCardHeaderProps> = ({
  children,
  className,
  withBrushStroke = false
}) => {
  return (
    <div 
      className={cn(
        'p-6 pb-4',
        withBrushStroke && 'brush-stroke',
        className
      )}
    >
      {children}
    </div>
  );
};

interface SumiCardTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
}

export const SumiCardTitle: React.FC<SumiCardTitleProps> = ({
  children,
  className,
  level = 2
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  const levelClasses = {
    1: 'text-2xl font-bold font-display',
    2: 'text-xl font-semibold font-display',
    3: 'text-lg font-medium font-display'
  };

  return (
    <Component 
      className={cn(
        'text-card-foreground leading-tight',
        levelClasses[level],
        className
      )}
    >
      {children}
    </Component>
  );
};

interface SumiCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SumiCardContent: React.FC<SumiCardContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('px-6 pb-4', className)}>
      {children}
    </div>
  );
};

interface SumiCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const SumiCardFooter: React.FC<SumiCardFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('px-6 py-4 border-t border-border/30', className)}>
      {children}
    </div>
  );
};

// Export compound component
SumiCard.Header = SumiCardHeader;
SumiCard.Title = SumiCardTitle;
SumiCard.Content = SumiCardContent;
SumiCard.Footer = SumiCardFooter;