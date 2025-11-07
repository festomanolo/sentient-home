import { useState, useEffect } from "react";
import { bluetoothService, MusicState } from "@/services/bluetoothService";

export const useBluetoothControl = () => {
  const [musicState, setMusicState] = useState<MusicState>(bluetoothService.getMusicState());

  useEffect(() => {
    const unsubscribe = bluetoothService.subscribe((state) => {
      setMusicState(state);
    });

    return unsubscribe;
  }, []);

  const setVolume = (volume: number) => {
    bluetoothService.setVolume(volume);
  };

  const adjustVolume = (delta: number) => {
    bluetoothService.adjustVolume(delta);
  };

  const togglePlayback = () => {
    bluetoothService.togglePlayback();
  };

  return {
    musicState,
    setVolume,
    adjustVolume,
    togglePlayback,
  };
};
