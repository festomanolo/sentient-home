import { useEffect, useState, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { soundDetectionService } from "@/services/soundDetectionService";

export type MicrophoneState = 'inactive' | 'listening' | 'processing' | 'speaking' | 'error';

interface MicrophoneIndicatorProps {
  isListening?: boolean;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  state?: MicrophoneState;
  errorMessage?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
}

export const MicrophoneIndicator = ({ 
  isListening = false,
  isProcessing = false,
  isSpeaking = false,
  state: propState,
  errorMessage,
  size = "lg",
  showLabel = true
}: MicrophoneIndicatorProps) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>([]);
  const animationFrameRef = useRef<number>();

  // Determine state from props or individual flags
  const state: MicrophoneState = propState || (
    errorMessage ? 'error' :
    isSpeaking ? 'speaking' :
    isProcessing ? 'processing' :
    isListening ? 'listening' :
    'inactive'
  );

  useEffect(() => {
    if (!isListening && !isProcessing && !isSpeaking) {
      setAudioLevel(0);
      setFrequencyData([]);
      return;
    }

    // Subscribe to audio levels from sound detection service
    const updateAudioData = () => {
      if (soundDetectionService.isRunning()) {
        const volume = soundDetectionService.getCurrentVolume();
        setAudioLevel(Math.min(100, volume));
        
        // Generate frequency bars for visualization (8 bars)
        const bars = Array.from({ length: 8 }, () => 
          Math.random() * volume * 0.8 + volume * 0.2
        );
        setFrequencyData(bars);
      }
      
      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    };

    updateAudioData();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, isProcessing, isSpeaking]);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 36,
    xl: 48,
  };

  // Calculate scale based on audio level (1.0 to 1.5)
  const scale = 1 + (audioLevel / 100) * 0.5;

  // State-specific colors and animations
  const stateConfig = {
    inactive: {
      color: "bg-gray-500",
      glow: "shadow-lg shadow-gray-500/20",
      ringColor: "border-gray-400/30",
      icon: MicOff,
      label: "Inactive"
    },
    listening: {
      color: "bg-blue-500",
      glow: "shadow-2xl shadow-blue-500/50",
      ringColor: "border-blue-400/50",
      icon: Mic,
      label: "Listening"
    },
    processing: {
      color: "bg-purple-500",
      glow: "shadow-2xl shadow-purple-500/50",
      ringColor: "border-purple-400/50",
      icon: Mic,
      label: "Processing"
    },
    speaking: {
      color: "bg-green-500",
      glow: "shadow-2xl shadow-green-500/50",
      ringColor: "border-green-400/50",
      icon: Mic,
      label: "Speaking"
    },
    error: {
      color: "bg-red-500",
      glow: "shadow-2xl shadow-red-500/50",
      ringColor: "border-red-400/50",
      icon: AlertCircle,
      label: "Error"
    }
  };

  const config = stateConfig[state];
  const IconComponent = config.icon;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* Outer pulsing rings */}
        {state === 'listening' && (
          <>
            <div 
              className={`absolute ${sizeClasses[size]} rounded-full ${config.ringColor} border-2 animate-ping`}
              style={{ animationDuration: '2s' }}
            />
            <div 
              className={`absolute ${sizeClasses[size]} rounded-full ${config.ringColor} border-2 animate-ping`}
              style={{ animationDuration: '2s', animationDelay: '0.5s' }}
            />
          </>
        )}

        {/* Processing spinner */}
        {state === 'processing' && (
          <div 
            className={`absolute ${sizeClasses[size]} rounded-full border-4 border-purple-400/30 border-t-purple-400 animate-spin`}
          />
        )}

        {/* Speaking wave animation */}
        {state === 'speaking' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`absolute rounded-full border-2 ${config.ringColor} animate-ripple`}
                style={{
                  width: `${(i + 1) * 40}%`,
                  height: `${(i + 1) * 40}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Main orb */}
        <div
          className={`${sizeClasses[size]} rounded-full ${config.color} ${config.glow} 
            flex items-center justify-center transition-all duration-300 relative overflow-hidden`}
          style={{
            transform: state === 'listening' ? `scale(${scale})` : 'scale(1)',
          }}
        >
          {/* Icon */}
          <IconComponent 
            size={iconSizes[size]} 
            className="text-white z-10 relative"
          />

          {/* Frequency bars visualization */}
          {state === 'listening' && frequencyData.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center gap-0.5 px-4">
              {frequencyData.map((height, i) => (
                <div
                  key={i}
                  className="w-1 bg-white/30 rounded-full transition-all duration-100"
                  style={{
                    height: `${Math.max(10, (height / 100) * 80)}%`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        </div>

        {/* Audio level indicator (small bars around the orb) */}
        {state === 'listening' && audioLevel > 10 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30) * (Math.PI / 180);
              const distance = size === 'sm' ? 40 : size === 'md' ? 50 : size === 'lg' ? 60 : 80;
              const barHeight = (audioLevel / 100) * 20 + 5;
              
              return (
                <div
                  key={i}
                  className="absolute w-1 bg-blue-400/60 rounded-full transition-all duration-100"
                  style={{
                    height: `${barHeight}px`,
                    left: `calc(50% + ${Math.cos(angle) * distance}px)`,
                    top: `calc(50% + ${Math.sin(angle) * distance}px)`,
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Label and status */}
      {showLabel && (
        <div className="text-center">
          <p className={`text-sm font-medium ${
            state === 'error' ? 'text-red-500' :
            state === 'listening' ? 'text-blue-500' :
            state === 'processing' ? 'text-purple-500' :
            state === 'speaking' ? 'text-green-500' :
            'text-gray-500'
          }`}>
            {config.label}
          </p>
          {errorMessage && (
            <p className="text-xs text-red-400 mt-1 max-w-xs">
              {errorMessage}
            </p>
          )}
          {state === 'listening' && audioLevel > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Volume: {Math.round(audioLevel)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
};
