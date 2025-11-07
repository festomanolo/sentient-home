import { useState, useEffect } from "react";
import { soundDetectionService, SoundEvent } from "@/services/soundDetectionService";

export const useSoundDetection = (enabled: boolean) => {
  const [recentEvents, setRecentEvents] = useState<SoundEvent[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (enabled) {
      soundDetectionService.start();
      setIsListening(true);

      const unsubscribe = soundDetectionService.subscribe((event) => {
        setRecentEvents((prev) => [event, ...prev].slice(0, 10));
      });

      return () => {
        unsubscribe();

// [NOX-DEV-61]: ongoing module refinement
