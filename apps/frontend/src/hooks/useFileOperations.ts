import { useState } from "react";
import { UploadedFile, getSignedUrl } from "@/services/uploadService";

/**
 * Custom hook for file viewing and downloading operations
 */
export function useFileOperations() {
  const [viewerFile, setViewerFile] = useState<UploadedFile | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const handleViewFile = async (file: UploadedFile) => {
    const isDocument =
      file.mimeType === "application/pdf" ||
      file.mimeType.includes("word") ||
      file.mimeType.includes("document") ||
      file.mimeType.includes("sheet") ||
      file.mimeType.includes("excel") ||
      file.mimeType.includes("powerpoint") ||
      file.mimeType.includes("presentation");

    if (isDocument) {
      const newWindow = window.open("about:blank", "_blank");

      if (!newWindow) {
        alert("Pop-ups are blocked. Please enable pop-ups for this site.");
        return;
      }

      try {
        const url = await getSignedUrl(file.id);
        if (url) {
          newWindow.location.href = url;
        } else {
          newWindow.close();
          alert("Failed to generate download link. Please try again.");
        }
      } catch (error) {
        newWindow.close();
        console.error("Error getting file URL:", error);
        alert("Failed to open file. Please try again.");
      }
    } else {
      try {
        const url = await getSignedUrl(file.id);
        if (url) {
          setViewerFile(file);
          setViewerUrl(url);
          setViewerOpen(true);
        } else {
          alert("Failed to generate download link. Please try again.");
        }
      } catch (error) {
        console.error("Error getting file URL:", error);
        alert("Failed to open file. Please try again.");
      }
    }
  };

  const handleDownloadFile = async (file: UploadedFile) => {
    try {
      const url = await getSignedUrl(file.id);
      if (!url) {
        alert("Failed to generate download link. Please try again.");
        return;
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalFileName;
      link.click();
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerFile(null);
    setViewerUrl(null);
  };

  return {
    viewerFile,
    viewerUrl,
    viewerOpen,
    handleViewFile,
    handleDownloadFile,
    closeViewer,
  };
}
