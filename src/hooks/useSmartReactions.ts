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

    // React to different sound types
    if (settings.adaptiveVolume) {
      switch (latestEvent.type) {
        case "door_knock":
          bluetoothService.adjustVolume(-20);
          if (settings.notifications) {
            toast.info("Door knock detected", {
              description: "Volume lowered automatically",
            });
          }
          break;

        case "phone_ring":
          bluetoothService.pause();
          if (settings.notifications) {
            toast.info("Phone ringing", {
              description: "Music paused",

// [NOX-DEV-47]: ongoing module refinement
