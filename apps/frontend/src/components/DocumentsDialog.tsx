import { FileText, Eye, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadedFile } from '@/services/uploadService';

interface DocumentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workflowStep: string | null;
  documents: UploadedFile[];
  onViewFile: (file: UploadedFile) => void;
  onDownloadFile: (file: UploadedFile) => void;
  showDownloadButton?: boolean;
}

export default function DocumentsDialog({
  isOpen,
  onClose,
  workflowStep,
  documents,
  onViewFile,
  onDownloadFile,
  showDownloadButton = true,
}: DocumentsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Documents - {workflowStep}</DialogTitle>
          <DialogDescription>
            Files attached at this workflow step
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {documents.length > 0 ? (
            documents.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.originalFileName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.fileSize / 1024).toFixed(2)} KB
                      {file.uploadedBy && ` • Uploaded by ${file.uploadedBy.firstName} ${file.uploadedBy.lastName}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewFile(file)}
                    title="View file"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {showDownloadButton && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownloadFile(file)}
                      title="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No documents attached at this step
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
