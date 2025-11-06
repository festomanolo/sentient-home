import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommandHistoryEntry {
  id: string;
  transcript: string;
  timestamp: Date;
  status: 'processing' | 'success' | 'error';
  response?: string;
}

interface CommandFeedbackProps {
  currentCommand?: string;
  isProcessing?: boolean;
  lastResponse?: string;
  showHistory?: boolean;
}

export const CommandFeedback = ({
  currentCommand,
  isProcessing = false,
  lastResponse,
  showHistory = true
}: CommandFeedbackProps) => {
  const [history, setHistory] = useState<CommandHistoryEntry[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (currentCommand) {
      setShowFeedback(true);
      
      // Add to history
      const entry: CommandHistoryEntry = {
        id: Date.now().toString(),
        transcript: currentCommand,
        timestamp: new Date(),
        status: isProcessing ? 'processing' : 'success',
        response: lastResponse
      };


// [NOX-DEV-27]: ongoing module refinement
