import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Loader2, Plus, Pencil, Trash2, Save, X, Eye, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface EmailTemplate {
  id: number;
  type: string;
  recipientRole: string;
  name: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
  variables: any;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const EMAIL_TYPES = [
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'password_reset', label: 'Password Reset' },
  { value: 'booking_confirmation', label: 'Booking Confirmation' },
  { value: 'booking_approval', label: 'Booking Approval' },
  { value: 'booking_cancellation', label: 'Booking Cancellation' },
  { value: 'booking_update', label: 'Booking Update' },
  { value: 'new_message', label: 'New Message' },
  { value: 'booking_request', label: 'Booking Request' },
];

const RECIPIENT_ROLES = [
  { value: 'user', label: 'User (Guest)' },
  { value: 'host', label: 'Host (Property Owner)' },
  { value: 'admin', label: 'Admin' },
];

const TEMPLATE_VARIABLES = {
  welcome: ['{{userName}}', '{{email}}', '{{loginUrl}}'],
  password_reset: ['{{userName}}', '{{resetLink}}', '{{expirationTime}}'],
  booking_confirmation: ['{{userName}}', '{{hostName}}', '{{locationName}}', '{{checkIn}}', '{{checkOut}}', '{{totalPrice}}', '{{bookingId}}'],
  booking_approval: ['{{userName}}', '{{hostName}}', '{{locationName}}', '{{checkIn}}', '{{checkOut}}', '{{bookingId}}'],
  booking_cancellation: ['{{userName}}', '{{hostName}}', '{{locationName}}', '{{checkIn}}', '{{checkOut}}', '{{cancellationReason}}'],
  booking_update: ['{{userName}}', '{{hostName}}', '{{locationName}}', '{{changes}}', '{{bookingId}}'],
  new_message: ['{{userName}}', '{{senderName}}', '{{messagePreview}}', '{{messageUrl}}'],
  booking_request: ['{{userName}}', '{{hostName}}', '{{locationName}}', '{{checkIn}}', '{{checkOut}}', '{{guestMessage}}'],
};

export function EmailTemplates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EmailTemplate>>({});
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html');
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/email/templates'],
  });

  const createTemplate = useMutation({
    mutationFn: (data: Partial<EmailTemplate>) =>
      apiRequest('/api/email/templates', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email/templates'] });
      toast({
        title: 'Template Created',
        description: 'Email template has been created successfully.',
      });
      setIsCreating(false);
      setEditForm({});
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create template',
        variant: 'destructive',
      });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EmailTemplate> }) =>
      apiRequest(`/api/email/templates/${id}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email/templates'] });
      toast({
        title: 'Template Updated',
        description: 'Email template has been updated successfully.',
      });
      setIsEditing(false);
      setEditForm({});
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update template',
        variant: 'destructive',
      });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/email/templates/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email/templates'] });
      toast({
        title: 'Template Deleted',
        description: 'Email template has been deleted successfully.',
      });
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template',
        variant: 'destructive',
      });
    },
  });

  const sendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) {
      toast({
        title: 'Error',
        description: 'Please select a template and enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingTest(true);
    try {
      await apiRequest('/api/email/test', {
        method: 'POST',
        body: {
          type: selectedTemplate.type.replace('_', '-'),
          email: testEmail,
        },
      });
      toast({
        title: 'Test Email Sent',
        description: `Test email sent to ${testEmail}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send test email',
        variant: 'destructive',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    const key = template.type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(template);
    return acc;
  }, {} as Record<string, EmailTemplate[]>);

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditForm({
      type: 'welcome',
      recipientRole: 'user',
      name: '',
      subject: '',
      htmlContent: '',
      textContent: '',
      active: true,
    });
  };

  const handleSaveTemplate = () => {
    if (isCreating) {
      createTemplate.mutate(editForm);
    } else if (isEditing && selectedTemplate) {
      updateTemplate.mutate({ id: selectedTemplate.id, data: editForm });
    }
  };

  const renderVariableHelp = () => {
    const type = isCreating || isEditing ? editForm.type : selectedTemplate?.type;
    const variables = type ? TEMPLATE_VARIABLES[type as keyof typeof TEMPLATE_VARIABLES] : [];
    
    if (variables.length === 0) return null;

    return (
      <Alert className="mb-4">
        <AlertDescription>
          <strong>Available Variables:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {variables.map((variable) => (
              <Badge key={variable} variant="secondary">
                {variable}
              </Badge>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>
              Manage email templates with role-specific variations for hosts and users
            </CardDescription>
          </div>
          <Button onClick={handleCreateNew} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
                  <div key={type} className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      {EMAIL_TYPES.find((t) => t.value === type)?.label || type}
                    </h3>
                    {typeTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id ? 'border-primary' : ''
                        }`}
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsEditing(false);
                          setIsCreating(false);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={template.recipientRole === 'host' ? 'default' : 'secondary'}>
                                  {template.recipientRole}
                                </Badge>
                                <Badge variant={template.active ? 'success' : 'destructive'}>
                                  {template.active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Template Editor/Preview */}
            <div className="lg:col-span-2">
              {(selectedTemplate || isCreating) && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                      {isCreating ? 'Create Template' : isEditing ? 'Edit Template' : 'Template Details'}
                    </CardTitle>
                    <div className="flex gap-2">
                      {!isCreating && !isEditing && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditing(true);
                              setEditForm(selectedTemplate!);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this template?')) {
                                deleteTemplate.mutate(selectedTemplate!.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                      {(isEditing || isCreating) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditing(false);
                              setIsCreating(false);
                              setEditForm({});
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveTemplate}
                            disabled={createTemplate.isPending || updateTemplate.isPending}
                          >
                            {createTemplate.isPending || updateTemplate.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(isEditing || isCreating) ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="type">Email Type</Label>
                            <Select
                              value={editForm.type}
                              onValueChange={(value) => setEditForm({ ...editForm, type: value })}
                              disabled={!isCreating}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {EMAIL_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="recipientRole">Recipient Role</Label>
                            <Select
                              value={editForm.recipientRole}
                              onValueChange={(value) => setEditForm({ ...editForm, recipientRole: value })}
                              disabled={!isCreating}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {RECIPIENT_ROLES.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="name">Template Name</Label>
                          <Input
                            id="name"
                            value={editForm.name || ''}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="e.g., Welcome Email for New Users"
                          />
                        </div>

                        <div>
                          <Label htmlFor="subject">Email Subject</Label>
                          <Input
                            id="subject"
                            value={editForm.subject || ''}
                            onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                            placeholder="e.g., Welcome to Blocmark, {{userName}}!"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="active"
                            checked={editForm.active}
                            onCheckedChange={(checked) => setEditForm({ ...editForm, active: checked })}
                          />
                          <Label htmlFor="active">Active</Label>
                        </div>

                        {renderVariableHelp()}

                        <Tabs defaultValue="html" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="html">HTML Content</TabsTrigger>
                            <TabsTrigger value="text">Text Content</TabsTrigger>
                          </TabsList>
                          <TabsContent value="html">
                            <Textarea
                              value={editForm.htmlContent || ''}
                              onChange={(e) => setEditForm({ ...editForm, htmlContent: e.target.value })}
                              placeholder="HTML email content..."
                              rows={15}
                              className="font-mono text-sm"
                            />
                          </TabsContent>
                          <TabsContent value="text">
                            <Textarea
                              value={editForm.textContent || ''}
                              onChange={(e) => setEditForm({ ...editForm, textContent: e.target.value })}
                              placeholder="Plain text email content..."
                              rows={15}
                              className="font-mono text-sm"
                            />
                          </TabsContent>
                        </Tabs>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Email Type</Label>
                            <p className="text-sm mt-1">{EMAIL_TYPES.find((t) => t.value === selectedTemplate.type)?.label}</p>
                          </div>
                          <div>
                            <Label>Recipient Role</Label>
                            <p className="text-sm mt-1">{RECIPIENT_ROLES.find((r) => r.value === selectedTemplate.recipientRole)?.label}</p>
                          </div>
                        </div>

                        <div>
                          <Label>Template Name</Label>
                          <p className="text-sm mt-1">{selectedTemplate.name}</p>
                        </div>

                        <div>
                          <Label>Email Subject</Label>
                          <p className="text-sm mt-1">{selectedTemplate.subject}</p>
                        </div>

                        <div>
                          <Label>Status</Label>
                          <Badge className="mt-1" variant={selectedTemplate.active ? 'success' : 'destructive'}>
                            {selectedTemplate.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        {renderVariableHelp()}

                        <div>
                          <Label>Preview</Label>
                          <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as 'html' | 'text')}>
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="html">HTML</TabsTrigger>
                              <TabsTrigger value="text">Text</TabsTrigger>
                            </TabsList>
                            <TabsContent value="html">
                              <div className="border rounded-md p-4 bg-muted/10">
                                {selectedTemplate.htmlContent ? (
                                  <div dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }} />
                                ) : (
                                  <p className="text-muted-foreground">No HTML content</p>
                                )}
                              </div>
                            </TabsContent>
                            <TabsContent value="text">
                              <div className="border rounded-md p-4 bg-muted/10">
                                <pre className="whitespace-pre-wrap text-sm">
                                  {selectedTemplate.textContent || 'No text content'}
                                </pre>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>

                        <div className="border-t pt-4">
                          <Label>Send Test Email</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              type="email"
                              placeholder="Enter email address"
                              value={testEmail}
                              onChange={(e) => setTestEmail(e.target.value)}
                            />
                            <Button
                              onClick={sendTestEmail}
                              disabled={isSendingTest || !testEmail}
                            >
                              {isSendingTest ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Send Test'
                              )}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {!selectedTemplate && !isCreating && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Mail className="h-12 w-12 mb-4" />
                    <p>Select a template to view details or create a new one</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}