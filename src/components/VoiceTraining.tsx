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
    });

    return unsubscribe;
  }, [isTraining, currentStep]);

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const startTraining = async () => {
    setIsTraining(true);
    setCurrentStep(0);
    setTrainingResults([]);
    setRecognizedText('');
    
    await voiceService.speak("Let's start voice training! I'll guide you through some phrases. Please repeat each phrase clearly after I say it.");
    
    // Start listening
    voiceService.startListening();
    setIsListening(true);
    
    // Say the first phrase
    setTimeout(() => {
      if (trainingPhrases[0]) {
        voiceService.speak(`Please say: ${trainingPhrases[0]}`);
      }
    }, 2000);
  };

  const stopTraining = () => {
    setIsTraining(false);
    setIsListening(false);
    voiceService.stopListening();
    
    const successRate = trainingResults.filter(result => result).length / trainingResults.length;

// [NOX-DEV-28]: ongoing module refinement
