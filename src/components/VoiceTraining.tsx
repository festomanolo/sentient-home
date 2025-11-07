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
    
    if (successRate > 0.8) {
      voiceService.speak("Excellent! Your voice training is complete. I can understand you very well.");
    } else if (successRate > 0.6) {
      voiceService.speak("Good job! Your voice training is complete. I should be able to understand most of your commands.");
    } else {
      voiceService.speak("Training complete. You might want to try again in a quieter environment for better results.");
    }
  };

  const restartTraining = () => {
    setCurrentStep(0);
    setTrainingResults([]);
    setRecognizedText('');
    
    if (trainingPhrases[0]) {
      voiceService.speak(`Let's try again. Please say: ${trainingPhrases[0]}`);
    }
  };

  const testVoice = async () => {
    await voiceService.speak("Hello Manolo! This is how I sound. You can adjust my voice settings in the configuration above.");
  };

  const progress = isTraining ? (currentStep / trainingPhrases.length) * 100 : 0;
  const isComplete = currentStep >= trainingPhrases.length && isTraining;

  useEffect(() => {
    if (isComplete) {
      stopTraining();
    }
  }, [isComplete]);

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Mic className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Voice Training</h2>
      </div>

      {!isTraining ? (
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Training Tips</h3>
            <div className="grid gap-2">
              {trainingTips.slice(0, 4).map((tip, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={startTraining} className="flex-1">
              <Mic className="w-4 h-4 mr-2" />
              Start Voice Training
            </Button>
            <Button variant="outline" onClick={testVoice}>
              <Play className="w-4 h-4 mr-2" />
              Test Voice
            </Button>
          </div>

          {trainingResults.length > 0 && (
            <div className="p-4 rounded-lg bg-background/30 border border-border/20">
              <h4 className="font-medium mb-2">Last Training Results</h4>
              <div className="flex gap-2 mb-2">
                {trainingResults.map((result, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      result ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {result ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <XCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Success Rate: {Math.round((trainingResults.filter(r => r).length / trainingResults.length) * 100)}%
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Training Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentStep} / {trainingPhrases.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {currentStep < trainingPhrases.length && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Step {currentStep + 1}</Badge>
                {isListening && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Mic className="w-4 h-4" />
                    <span className="text-sm">Listening...</span>
                  </div>
                )}
              </div>
              <p className="font-medium mb-2">Please say:</p>
              <p className="text-lg">{trainingPhrases[currentStep]}</p>
              
              {recognizedText && (
                <div className="mt-3 p-2 rounded bg-background/50">
                  <p className="text-sm text-muted-foreground">I heard:</p>
                  <p className="font-medium">{recognizedText}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={restartTraining}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
            <Button variant="outline" onClick={stopTraining}>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Training
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
};