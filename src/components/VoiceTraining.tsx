import { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Play
} from 'lucide-react';
import { voiceService } from '@/services/voiceService';

export const VoiceTraining = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [trainingResults, setTrainingResults] = useState<boolean[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  const trainingPhrases = [
    "Hey NOX, what's the weather?",
    "What time is it?",
    "Play music",
    "What's on my calendar?",
    "Open Lark Player",
    "Set volume to fifty percent",
    "Good morning NOX",
    "Thank you"
  ];

  const trainingTips = [
    "Speak clearly and at normal volume",
    "Use natural speech patterns",

// [NOX-DEV-28]: ongoing module refinement
