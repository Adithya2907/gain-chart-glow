import { useState, useRef } from 'react';
import { Download, Upload, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onExport: () => string;
  onImport: (jsonData: string) => { success: boolean; error?: string };
}

export function SettingsModal({ open, onClose, onExport, onImport }: SettingsModalProps) {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const jsonData = onExport();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `gymtrack-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setImportStatus({ type: 'success', message: 'Data exported successfully!' });
      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      setImportStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to export data' 
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const result = onImport(jsonData);
        
        if (result.success) {
          setImportStatus({ type: 'success', message: 'Data imported successfully!' });
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 2000);
        } else {
          setImportStatus({ type: 'error', message: result.error || 'Failed to import data' });
        }
      } catch (error) {
        setImportStatus({ 
          type: 'error', 
          message: error instanceof Error ? error.message : 'Failed to read file' 
        });
      }
    };
    
    reader.onerror = () => {
      setImportStatus({ type: 'error', message: 'Failed to read file' });
    };
    
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportWithConfirm = () => {
    setShowConfirmDialog(true);
  };

  const confirmImport = () => {
    setShowConfirmDialog(false);
    handleImportClick();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">Data Backup & Restore</DialogTitle>
            <DialogDescription>
              Export your workout data to a JSON file or import from a previous backup.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {importStatus && (
              <Alert variant={importStatus.type === 'error' ? 'destructive' : 'default'}>
                {importStatus.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{importStatus.message}</AlertDescription>
              </Alert>
            )}

            <div className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Export Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download all your workout data as a JSON backup file.
                  </p>
                  <Button onClick={handleExport} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export to JSON
                  </Button>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Import Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Restore your workout data from a previously exported JSON file. This will replace all current data.
                  </p>
                  <Button 
                    onClick={handleImportWithConfirm} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import from JSON
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Your data is currently stored in browser localStorage. 
                  Regular backups are recommended to prevent data loss.
                </p>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Import</AlertDialogTitle>
            <AlertDialogDescription>
              Importing data will replace all your current workout data. This action cannot be undone. 
              Make sure you have a backup of your current data before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Import Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

