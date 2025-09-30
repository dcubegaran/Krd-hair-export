"use client";

import { useState, useEffect } from "react";
import { uploadQueue } from "@/lib/services/uploadQueue";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, CheckCircle } from "lucide-react";

export function UploadQueueStatus() {
  const [queueStatus, setQueueStatus] = useState({
    queueLength: 0,
    oldestItem: null,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const status = uploadQueue.getQueueStatus();
      setQueueStatus(status);
      setIsVisible(status.queueLength > 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleForceProcess = async () => {
    await uploadQueue.forceProcess();
    setQueueStatus(uploadQueue.getQueueStatus());
  };

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Upload Queue Status
        </CardTitle>
        <CardDescription className="text-xs">
          Processing file metadata in background
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-blue-600" />
            <span className="text-sm">Queued items:</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {queueStatus.queueLength}
          </Badge>
        </div>

        {queueStatus.oldestItem && (
          <div className="text-xs text-muted-foreground mb-2">
            Oldest: {Math.round((Date.now() - queueStatus.oldestItem) / 1000)}s
            ago
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleForceProcess}
            className="text-xs h-7"
          >
            Process Now
          </Button>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            Auto-processing in 5s
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
