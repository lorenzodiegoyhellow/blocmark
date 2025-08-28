import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { History, User, Calendar, Edit, CheckCircle, XCircle, AlertCircle, Settings, Plus, Trash, RefreshCw } from "lucide-react";

interface LocationEditHistory {
  id: number;
  locationId: number;
  editorId: number;
  editedAt: string;
  changedFields: string[];
  previousData: Record<string, any>;
  newData: Record<string, any>;
  editType: "update" | "status_change" | "creation" | "update_pending_review" | "booking_options_update" | "calendar_update" | "addon_create" | "addon_update" | "addon_delete";
  reason?: string;
  ipAddress?: string;
  editorUsername: string;
  editorEmail: string;
}

interface LocationHistoryResponse {
  location: {
    id: number;
    title: string;
    ownerId: number;
  };
  history: LocationEditHistory[];
}

interface LocationHistoryViewerProps {
  locationId: number;
  locationTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const getEditTypeIcon = (type: string) => {
  switch (type) {
    case "creation":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "status_change":
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case "update":
      return <Edit className="h-4 w-4 text-blue-600" />;
    case "update_pending_review":
      return <RefreshCw className="h-4 w-4 text-orange-600" />;
    case "booking_options_update":
      return <Settings className="h-4 w-4 text-purple-600" />;
    case "calendar_update":
      return <Calendar className="h-4 w-4 text-indigo-600" />;
    case "addon_create":
      return <Plus className="h-4 w-4 text-green-600" />;
    case "addon_update":
      return <Edit className="h-4 w-4 text-blue-600" />;
    case "addon_delete":
      return <Trash className="h-4 w-4 text-red-600" />;
    default:
      return <Edit className="h-4 w-4 text-gray-600" />;
  }
};

const getEditTypeLabel = (type: string) => {
  switch (type) {
    case "creation":
      return "Created";
    case "status_change":
      return "Status Changed";
    case "update":
      return "Updated";
    case "update_pending_review":
      return "Updated (Pending Review)";
    case "booking_options_update":
      return "Booking Options Updated";
    case "calendar_update":
      return "Calendar Updated";
    case "addon_create":
      return "Add-on Created";
    case "addon_update":
      return "Add-on Updated";
    case "addon_delete":
      return "Add-on Deleted";
    default:
      return "Modified";
  }
};

const formatFieldName = (field: string) => {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

export function LocationHistoryViewer({ locationId, locationTitle, isOpen, onClose }: LocationHistoryViewerProps) {
  const {
    data: historyData,
    isLoading,
    error
  } = useQuery<LocationHistoryResponse>({
    queryKey: [`/api/admin/locations/${locationId}/history`],
    enabled: isOpen
  });

  const renderFieldChange = (field: string, previousValue: any, newValue: any) => {
    const fieldName = formatFieldName(field);
    
    return (
      <div key={field} className="space-y-1">
        <div className="font-medium text-sm text-gray-700">{fieldName}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <div className="text-gray-500">Previous:</div>
            <div className="p-2 bg-red-50 rounded border border-red-200 min-h-[2rem] break-words">
              {previousValue !== null && previousValue !== undefined 
                ? String(previousValue) 
                : <span className="text-gray-400 italic">None</span>
              }
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-500">New:</div>
            <div className="p-2 bg-green-50 rounded border border-green-200 min-h-[2rem] break-words">
              {newValue !== null && newValue !== undefined 
                ? String(newValue) 
                : <span className="text-gray-400 italic">None</span>
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Edit History: {locationTitle}
          </DialogTitle>
          <DialogDescription>
            Complete history of all changes made to this location
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          
          {error && (
            <div className="text-center p-8 text-red-600">
              Failed to load location history. Please try again.
            </div>
          )}
          
          {historyData && (
            <div className="space-y-6">
              {historyData.history.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  No edit history found for this location.
                </div>
              ) : (
                historyData.history.map((entry, index) => (
                  <div key={entry.id} className="border rounded-lg p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getEditTypeIcon(entry.editType)}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {getEditTypeLabel(entry.editType)}
                            <Badge variant="outline" className="text-xs">
                              #{historyData.history.length - index}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {entry.editorUsername}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(entry.editedAt), 'MMM d, yyyy at h:mm a')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Reason */}
                    {entry.reason && (
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-medium text-sm mb-1">Reason:</div>
                        <div className="text-sm">{entry.reason}</div>
                      </div>
                    )}
                    
                    {/* Changed Fields */}
                    {entry.changedFields.length > 0 && (
                      <div className="space-y-3">
                        <div className="font-medium text-sm">
                          Changed Fields ({entry.changedFields.length}):
                        </div>
                        <div className="space-y-4">
                          {entry.changedFields.map(field => (
                            renderFieldChange(
                              field, 
                              entry.previousData?.[field], 
                              entry.newData?.[field]
                            )
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {index < historyData.history.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}