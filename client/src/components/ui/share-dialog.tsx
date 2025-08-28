import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import { AiOutlineWhatsApp } from "react-icons/ai";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
  text?: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  title,
  url,
  text = "Check out this space on the platform!",
}: ShareDialogProps) {
  const { toast } = useToast();

  const shareText = `${text} ${title}`;

  const handleShare = (platform: string) => {
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${url}`)}`;
        break;
      case "sms":
        shareUrl = `sms:?body=${encodeURIComponent(`${shareText} ${url}`)}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text} ${url}`)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url).then(() => {
          toast({
            title: "Link copied",
            description: "Link copied to clipboard",
          });
        });
        return;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this location</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 h-auto py-6"
            onClick={() => handleShare("facebook")}
          >
            <FaFacebook className="h-5 w-5 text-[#1877F2]" />
            <span>Facebook</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 h-auto py-6"
            onClick={() => handleShare("sms")}
          >
            <MessageCircle className="h-5 w-5 text-gray-600" />
            <span>SMS</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 h-auto py-6"
            onClick={() => handleShare("twitter")}
          >
            <FaTwitter className="h-5 w-5 text-[#1DA1F2]" />
            <span>Twitter</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 h-auto py-6"
            onClick={() => handleShare("email")}
          >
            <Mail className="h-5 w-5 text-gray-600" />
            <span>Email</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 h-auto py-6"
            onClick={() => handleShare("whatsapp")}
          >
            <AiOutlineWhatsApp className="h-5 w-5 text-[#25D366]" />
            <span>WhatsApp</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 h-auto py-6"
            onClick={() => handleShare("copy")}
          >
            <Copy className="h-5 w-5 text-gray-600" />
            <span>Copy link</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}