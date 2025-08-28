import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft } from "lucide-react";

export function ReportUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting",
        variant: "destructive"
      });
      return;
    }
    
    if (!details.trim()) {
      toast({
        title: "Error",
        description: "Please provide details about the issue",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          reportedUserId: parseInt(userId!),
          reason,
          details
        })
      });
      
      toast({
        title: "Report submitted",
        description: "Thank you for your report. Our team will review it shortly."
      });
      
      // Navigate back to messages
      navigate('/messages');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Button
        onClick={() => window.history.back()}
        variant="ghost"
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Report User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Why are you reporting this user?</Label>
              <RadioGroup value={reason} onValueChange={setReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate_content" id="inappropriate_content" />
                  <Label htmlFor="inappropriate_content" className="cursor-pointer">
                    Inappropriate content or behavior
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spam" id="spam" />
                  <Label htmlFor="spam" className="cursor-pointer">
                    Spam or advertising
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scam" id="scam" />
                  <Label htmlFor="scam" className="cursor-pointer">
                    Scam or fraudulent activity
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="harassment" id="harassment" />
                  <Label htmlFor="harassment" className="cursor-pointer">
                    Harassment or bullying
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fake_profile" id="fake_profile" />
                  <Label htmlFor="fake_profile" className="cursor-pointer">
                    Fake profile or impersonation
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer">
                    Other
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">
                Please provide more details about the issue
              </Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what happened..."
                className="min-h-[120px]"
                required
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> False reports may result in action being taken against your account. 
                Please ensure all information provided is accurate and truthful.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}