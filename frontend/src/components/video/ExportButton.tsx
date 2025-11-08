import { useState } from 'react';
import { Download } from 'lucide-react';
import { exportService } from '../../api/services';
import { useAppDispatch } from '../../store/hooks';
import { showNotification } from '../../store/slices/uiSlice';
import { API_CONFIG } from '../../config/api.config';

interface ExportButtonProps {
  sessionId: number;
  disabled?: boolean;
}

const ExportButton = ({ sessionId, disabled = false }: ExportButtonProps) => {
  const dispatch = useAppDispatch();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportService.exportVideo(sessionId);
      
      dispatch(
        showNotification({
          message: 'Video exported successfully! Downloading...',
          type: 'success',
        })
      );

      // Fetch video as blob and trigger download
      const downloadUrl = `${API_CONFIG.BASE_URL}${result.download_url}`;
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      // Create blob URL and download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `videoable-session-${sessionId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export video';
      dispatch(
        showNotification({
          message: errorMessage,
          type: 'error',
        })
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || exporting}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
    >
      <Download size={16} />
      {exporting ? 'Exporting...' : 'Export Video'}
    </button>
  );
};

export default ExportButton;
