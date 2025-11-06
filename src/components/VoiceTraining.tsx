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
    "Ensure you're in a quiet environment",
    "Position yourself 1-2 feet from the microphone",
    "Speak at a normal pace, not too fast or slow",
    "Try different voice tones and inflections",
    "Practice the wake word 'Hey NOX' clearly",
    "Test various command variations"
  ];

  useEffect(() => {
    // Subscribe to voice commands during training
    const unsubscribe = voiceService.subscribeToCommands((command) => {
      setRecognizedText(command.command);
      
      if (isTraining && currentStep < trainingPhrases.length) {
        const expectedPhrase = trainingPhrases[currentStep].toLowerCase();
        const recognizedPhrase = command.command.toLowerCase();
        
        // Check if the recognized phrase matches (with some flexibility)
        const isMatch = recognizedPhrase.includes(expectedPhrase.replace('hey nox, ', '')) ||
                       expectedPhrase.includes(recognizedPhrase) ||
                       calculateSimilarity(expectedPhrase, recognizedPhrase) > 0.7;
        
        setTrainingResults(prev => [...prev, isMatch]);
        
        if (isMatch) {
          voiceService.speak("Great! I understood that perfectly.");
        } else {
          voiceService.speak("Let me try that again. Please repeat the phrase.");
        }
        
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setRecognizedText('');
        }, 2000);
      }

// [NOX-DEV-28]: ongoing module refinement
