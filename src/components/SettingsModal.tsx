import { useState, useRef } from 'react';
import { Download, Upload, CheckCircle2, AlertCircle, FileText, User, Plus, Trash2, Edit2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { BodyMeasurement } from '@/types/workout';
import { format } from 'date-fns';
import { BodyMeasurementsForm } from './BodyMeasurementsForm';
import { BodyMeasurementsProgress } from './BodyMeasurementsProgress';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onExport: () => string;
  onImport: (jsonData: string) => { success: boolean; error?: string };
  measurements: BodyMeasurement[];
  onAddMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => void;
  onUpdateMeasurement: (id: string, measurement: Partial<BodyMeasurement>) => void;
  onDeleteMeasurement: (id: string) => void;
}

export function SettingsModal({ 
  open, 
  onClose, 
  onExport, 
  onImport,
  measurements,
  onAddMeasurement,
  onUpdateMeasurement,
  onDeleteMeasurement,
}: SettingsModalProps) {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurement | null>(null);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
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

  const handleMeasurementSubmit = (measurement: Omit<BodyMeasurement, 'id'>) => {
    if (editingMeasurement) {
      onUpdateMeasurement(editingMeasurement.id, measurement);
    } else {
      onAddMeasurement(measurement);
    }
    setEditingMeasurement(null);
    setShowMeasurementForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[85vh] bg-card border-border overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Settings</DialogTitle>
            <DialogDescription>
              Manage your profile and data backup settings.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Body Measurements
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track your body measurements over time
                    </p>
                  </div>
                  {!showMeasurementForm && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingMeasurement(null);
                        setShowMeasurementForm(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>

                {showMeasurementForm ? (
                  <div className="glass-card rounded-xl p-4 mb-4">
                    <BodyMeasurementsForm
                      measurement={editingMeasurement || undefined}
                      onSubmit={handleMeasurementSubmit}
                      onCancel={() => {
                        setShowMeasurementForm(false);
                        setEditingMeasurement(null);
                      }}
                    />
                  </div>
                ) : null}

                {measurements.length === 0 && !showMeasurementForm ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No measurements recorded yet.</p>
                    <p className="text-xs mt-1">Add your first measurement to start tracking!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {measurements.map((measurement) => (
                      <div
                        key={measurement.id}
                        className="glass-card rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-sm">
                                {formatDate(measurement.date)}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => {
                                    setEditingMeasurement(measurement);
                                    setShowMeasurementForm(true);
                                  }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  onClick={() => onDeleteMeasurement(measurement.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {measurement.weight && (
                                <div>
                                  <span className="text-muted-foreground">Weight: </span>
                                  <span className="font-medium">{measurement.weight} kg</span>
                                </div>
                              )}
                              {measurement.bodyFat && (
                                <div>
                                  <span className="text-muted-foreground">Body Fat: </span>
                                  <span className="font-medium">{measurement.bodyFat}%</span>
                                </div>
                              )}
                              {measurement.chest && (
                                <div>
                                  <span className="text-muted-foreground">Chest: </span>
                                  <span className="font-medium">{measurement.chest} cm</span>
                                </div>
                              )}
                              {measurement.waist && (
                                <div>
                                  <span className="text-muted-foreground">Waist: </span>
                                  <span className="font-medium">{measurement.waist} cm</span>
                                </div>
                              )}
                              {measurement.hips && (
                                <div>
                                  <span className="text-muted-foreground">Hips: </span>
                                  <span className="font-medium">{measurement.hips} cm</span>
                                </div>
                              )}
                              {measurement.biceps && (
                                <div>
                                  <span className="text-muted-foreground">Biceps: </span>
                                  <span className="font-medium">{measurement.biceps} cm</span>
                                </div>
                              )}
                              {measurement.thighs && (
                                <div>
                                  <span className="text-muted-foreground">Thighs: </span>
                                  <span className="font-medium">{measurement.thighs} cm</span>
                                </div>
                              )}
                            </div>
                            {measurement.notes && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {measurement.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4 mt-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4" />
                  Body Measurements Progress
                </h3>
                <BodyMeasurementsProgress measurements={measurements} />
              </div>
            </TabsContent>

            <TabsContent value="backup" className="space-y-4 mt-4">
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
                      Download all your workout data and measurements as a JSON backup file.
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
            </TabsContent>
          </Tabs>

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
              Importing data will replace all your current workout data and measurements. This action cannot be undone. 
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
