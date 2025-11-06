import { useState, useEffect } from "react";
import { bluetoothService, MusicState } from "@/services/bluetoothService";

export const useBluetoothControl = () => {
  const [musicState, setMusicState] = useState<MusicState>(bluetoothService.getMusicState());

  useEffect(() => {
    const unsubscribe = bluetoothService.subscribe((state) => {
      setMusicState(state);
    });

// [NOX-DEV-60]: ongoing module refinement
