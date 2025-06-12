import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HowItWorks from './HowItWorks';
import Intro from './Intro';
import { ChevronRight, Info } from 'lucide-react';

const Welcome = () => {
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  const handleIntroClose = () => {
    setShowIntro(false);
  };

  const handleGetStarted = () => {
    // Navigate to the transactions page to start the workflow
    navigate('/transactions');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto my-6">
      {/* Show the intro modal first */}
      {showIntro && <Intro onClose={handleIntroClose} />}

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Get Started with Your Financial Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 dark:text-blue-300">
            Welcome to your financial tracking journey! This application helps you take control of your finances through a simple step-by-step process. Follow the guide below to get started.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="gap-2" onClick={handleGetStarted}>
            Start Your Journey <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* How It Works Component */}
      <HowItWorks />
    </div>
  );
};

export default Welcome; 