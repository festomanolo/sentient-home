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
            });
          }
          break;

        case "voice":
          bluetoothService.adjustVolume(-15);
          if (settings.notifications) {
            toast.info("Voice detected", {
              description: "Listening for commands...",
            });
          }
          break;
      }
    } else if (settings.notifications) {
      // Just notify without taking action
      const messages = {
        door_knock: "Someone's knocking at the door",
        phone_ring: "Your phone is ringing",
        voice: "Voice activity detected",
        silence: "Environment is quiet",
      };
      
      toast(messages[latestEvent.type] || "Sound detected");
    }
  }, [soundEvents, settings.adaptiveVolume, settings.notifications]);
};
