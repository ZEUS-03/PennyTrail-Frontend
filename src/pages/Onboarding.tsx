import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mail, Shield, Check, ArrowRight, ArrowLeft, User } from "lucide-react";
import { Link } from "react-router-dom";
import { authService } from "@/services/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { googleOAuth } from "@/utils";
import { getSteps } from "@/constants";
import { Dialog } from "@/components/ui/dialog";

const Onboarding = () => {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const steps = getSteps({
    onGoogleOAuth: () => googleOAuth(),
    onContinueGuest: () => setShowGuestModal(true),
  });
  const [currentStep, setCurrentStep] = useState(0);
  const currentStepData = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="p-8 bg-gradient-card border-0 shadow-medium animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{currentStepData.title}</h1>
            <p className="text-muted-foreground">
              {currentStepData.description}
            </p>
          </div>

          <div className="mb-8">{currentStepData.content}</div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep === steps.length - 1 ? (
              <Link to="/dashboard">
                <Button variant="financial">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="default"
                onClick={() =>
                  setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
                }
                disabled={currentStep === 1}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
      {showGuestModal && (
        <Dialog open={showGuestModal} onOpenChange={setShowGuestModal} />
      )}
    </div>
  );
};

export default Onboarding;
