import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AIOrb } from "@/components/AIOrb";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const nextStep = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentStep = onboardingSteps[step];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="flex gap-2 mb-12 justify-center animate-fade-in">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === step ? "w-12 bg-primary" : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center animate-fade-in" key={step}>
          {/* Icon/Orb */}
          {step === 0 ? (
            <div className="flex justify-center mb-8">
              <AIOrb isListening={true} size="lg" />
            </div>
          ) : (
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center backdrop-blur-xl">
                <currentStep.icon className="w-12 h-12 text-primary" />
              </div>
            </div>
          )}

          {/* Title & Description */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {currentStep.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
            {currentStep.description}
          </p>

          {/* Navigation */}
          <div className="flex gap-4 justify-center">
            {step > 0 && (
              <Button variant="outline" size="lg" onClick={prevStep}>
                <ArrowLeft className="mr-2 w-5 h-5" />
                Back
              </Button>
            )}
            <Button size="lg" onClick={nextStep} className="px-8">
              {step === onboardingSteps.length - 1 ? (
                <>
                  Get Started <Check className="ml-2 w-5 h-5" />
                </>
              ) : (
                <>
                  Continue <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </div>

          {/* Skip */}
          {step < onboardingSteps.length - 1 && (
            <Button
              asChild
              variant="ghost"
              className="mt-6"
            >
              <Link to="/dashboard">Skip for now</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const onboardingSteps = [
  {
    title: "Welcome to NOX AI",
    description: "Transform your old phone into the smartest home companion. NOX AI listens, learns, and adapts to your environment.",
    icon: null,
  },
  {
    title: "Always Listening",
    description: "NOX AI detects door knocks, phone rings, and voices - responding intelligently to keep you informed and in control.",
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    ),
  },
  {
    title: "Self-Learning Intelligence",
    description: "The more NOX AI experiences your routines, the smarter it becomes - automatically adapting to your lifestyle.",
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20Z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: "Privacy First, Always",
    description: "All processing happens on your device. Your data never leaves your phone. Complete control, complete privacy.",
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

export default Onboarding;
