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

// [NOX-DEV-15]: ongoing module refinement
