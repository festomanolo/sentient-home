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
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-4">
      {/* Current Command Feedback */}
      {showFeedback && currentCommand && (
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(isProcessing ? 'processing' : 'success')} 
          backdrop-blur-sm animate-slide-up`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {getStatusIcon(isProcessing ? 'processing' : 'success')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium">
                  {isProcessing ? 'Processing...' : 'Command Recognized'}
                </p>
                <Badge variant="outline" className="text-xs">
                  {isProcessing ? 'Analyzing' : 'Complete'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                "{currentCommand}"
              </p>
              {lastResponse && !isProcessing && (
                <p className="text-xs text-accent mt-2">
                  {lastResponse}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Command History */}
      {showHistory && history.length > 0 && (
        <div className="p-4 rounded-lg border border-border/50 backdrop-blur-sm bg-background/30">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold">Command History</h3>
            <Badge variant="secondary" className="text-xs ml-auto">
              {history.length}
            </Badge>
          </div>
          
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="p-2 rounded-md bg-background/50 border border-border/30 hover:bg-background/70 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {getStatusIcon(entry.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {entry.transcript}
                      </p>
                      {entry.response && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.response}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatTimeAgo(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
