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

      setHistory(prev => [entry, ...prev].slice(0, 20)); // Keep last 20

      // Auto-hide feedback after 3 seconds if not processing
      if (!isProcessing) {
        setTimeout(() => {
          setShowFeedback(false);
        }, 3000);
      }
    }
  }, [currentCommand, isProcessing, lastResponse]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;

// [NOX-DEV-27]: ongoing module refinement
