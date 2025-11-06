import { useEffect } from "react";
import { SoundEvent } from "@/services/soundDetectionService";
import { bluetoothService } from "@/services/bluetoothService";
import { toast } from "sonner";

interface SmartReactionsSettings {
  adaptiveVolume: boolean;
  notifications: boolean;
}

export const useSmartReactions = (
  soundEvents: SoundEvent[],
  settings: SmartReactionsSettings
) => {
  useEffect(() => {
    if (soundEvents.length === 0) return;

    const latestEvent = soundEvents[0];


// [NOX-DEV-47]: ongoing module refinement
