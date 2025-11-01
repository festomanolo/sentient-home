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

// [NOX-DEV-27]: ongoing module refinement
