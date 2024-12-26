import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowRight,
  FileText,
  PieChart,
  FolderTree,
  LayoutDashboard,
  Target
} from 'lucide-react';

const Intro = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDialog, setShowDialog] = useState(true);

  const features = [
    {
      icon: PieChart,
      title: "Track Every Dollar",
      description: "See exactly where your money goes with clear spending insights."
    },
    {
      icon: FileText,
      title: "Statement Sync",
      description: "Simply upload your bank statements. No account linkage needed."
    },
    {
      icon: FolderTree,
      title: "Smart Categories",
      description: "Organize transactions your way with customizable categories."
    },
    {
      icon: LayoutDashboard,
      title: "Clear Overview",
      description: "Get the full picture of your finances in one unified dashboard."
    },
    {
      icon: Target,
      title: "Budget Goals",
      description: "Set and track savings goals with focused budgeting."
    }
  ];

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      setShowDialog(false);
      onClose?.();
    }
  };

  const Feature = ({ feature }) => {
    const Icon = feature.icon;
    return (
      <div className="flex items-start gap-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium">{feature.title}</h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to Your Financial Journey</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {features[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Feature feature={features[currentStep]} />
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {features.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 w-6 rounded-full transition-colors ${
                  idx === currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          
          <Button onClick={handleNext} className="gap-2">
            {currentStep === features.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Intro;