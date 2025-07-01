import React, { useState } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Uniform help button component for showing How It Works dialogs
 * @param {React.Component} children - The How It Works component to display
 * @param {string} title - Dialog title
 * @param {string} variant - Button variant ('default' | 'outline' | 'ghost')
 * @param {string} size - Button size ('sm' | 'default' | 'lg')
 * @param {string} className - Additional CSS classes
 */
const HelpButton = ({ 
  children, 
  title = "How It Works", 
  variant = "outline", 
  size = "sm",
  className = "",
  buttonText = "How It Works"
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={cn("gap-2", className)}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">{buttonText}</span>
          <span className="sm:hidden">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {title}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpButton;