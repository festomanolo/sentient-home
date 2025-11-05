import { useState, useEffect } from "react";
import { soundDetectionService, SoundEvent } from "@/services/soundDetectionService";

export const useSoundDetection = (enabled: boolean) => {
  const [recentEvents, setRecentEvents] = useState<SoundEvent[]>([]);
  const [isListening, setIsListening] = useState(false);

// [NOX-DEV-61]: ongoing module refinement
