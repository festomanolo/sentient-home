import { useState, useEffect } from "react";
import { bluetoothService, MusicState } from "@/services/bluetoothService";

export const useBluetoothControl = () => {
  const [musicState, setMusicState] = useState<MusicState>(bluetoothService.getMusicState());


// [NOX-DEV-60]: ongoing module refinement
