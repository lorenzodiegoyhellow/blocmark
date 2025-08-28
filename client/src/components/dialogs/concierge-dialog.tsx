import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConciergeForm } from "@/components/forms/concierge-form";
import { Sparkles } from "lucide-react";

interface ConciergeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConciergeDialog({ isOpen, onClose }: ConciergeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-black border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-amber-400" />
            Blocmark Concierge Service
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="text-gray-300 mb-6">
            Our elite concierge service unlocks access to the world's most extraordinary locations for your unique needs.
          </p>
          
          <ConciergeForm onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}