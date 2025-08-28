import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { EmailTemplates } from './email-templates';

export function EmailDashboard() {
  const [testEmailType, setTestEmailType] = useState<string>('welcome');
  const [testEmail, setTestEmail] = useState('');
  
  // Fetch email events
  const { data: emailEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/email/events'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch email templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/email/templates'],
  });

  // Fetch email campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/email/campaigns'],
  });

  // Fetch suppression list
  const { data: suppressionList } = useQuery({
    queryKey: ['/api/email/suppression'],
  });

  // Send test email mutation
  const sendTestEmail = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await apiRequest('/api/email/test', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        
        // Try to parse as JSON
        let result;
        const text = await response.text();
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse response:', text);
          if (!response.ok) {
            throw new Error('Server error: Unable to send test email. Please try again.');
          }
          // If response is OK but not JSON, assume success
          return { success: true, message: 'Test email sent successfully' };
        }
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to send test email');
        }
        return result;
      } catch (error: any) {
        console.error('Test email error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Test email sent',
        description: data.message || 'Check your email inbox for the test message.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email/events'] });
      setTestEmail(''); // Clear the email field
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send test email',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  // Remove from suppression list mutation
  const removeFromSuppression = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest(`/api/email/suppression/${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Email removed from suppression list',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email/suppression'] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'bounced':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'queued':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      sent: 'default',
      delivered: 'default',
      opened: 'secondary',
      clicked: 'secondary',
      bounced: 'destructive',
      complained: 'destructive',
      failed: 'destructive',
      queued: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Email Management</h2>
        <p className="text-muted-foreground">Monitor and manage email communications</p>
      </div>

      <Tabs defaultValue="test" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="test">Test Email</TabsTrigger>
          <TabsTrigger value="events">Email Events</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="suppression">Suppression</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>
                Send a test email to verify the email system is working correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-type">Email Type</Label>
                <Select value={testEmailType} onValueChange={setTestEmailType}>
                  <SelectTrigger id="email-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="password-reset">Password Reset</SelectItem>
                    <SelectItem value="booking-confirmation">Booking Confirmation</SelectItem>
                    <SelectItem value="booking-update">Booking Update</SelectItem>
                    <SelectItem value="message-notification">Message Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-email">Recipient Email</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="Enter your real email address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter a valid email address that can receive emails. Do not use test@example.com as it's blocked.
                </p>
              </div>

              <Button
                onClick={() => sendTestEmail.mutate({
                  type: testEmailType,
                  email: testEmail
                })}
                disabled={sendTestEmail.isPending || !testEmail}
              >
                {sendTestEmail.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Events</CardTitle>
              <CardDescription>
                Track the status of sent emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : emailEvents && emailEvents.length > 0 ? (
                <div className="space-y-2">
                  {emailEvents.map((event: any) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(event.status)}
                        <div>
                          <div className="font-medium">{event.recipientEmail}</div>
                          <div className="text-sm text-muted-foreground">
                            {event.subject || event.templateName || 'No subject'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(event.status)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No email events found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>
                Manage marketing email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : campaigns && campaigns.length > 0 ? (
                <div className="space-y-2">
                  {campaigns.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.subject}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          campaign.status === 'sent' ? 'default' :
                          campaign.status === 'sending' ? 'secondary' :
                          'outline'
                        }>
                          {campaign.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {campaign.recipientCount} recipients
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No campaigns found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppression" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suppression List</CardTitle>
              <CardDescription>
                Emails that should not receive communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suppressionList && suppressionList.length > 0 ? (
                <div className="space-y-2">
                  {suppressionList.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{item.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Reason: {item.reason}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromSuppression.mutate(item.email)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Suppression list is empty
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}