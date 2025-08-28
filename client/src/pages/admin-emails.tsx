import { AdminLayout } from '@/components/admin/AdminLayout';
import { EmailDashboard } from '@/components/admin/email-dashboard';

export default function AdminEmailsPage() {
  return (
    <AdminLayout 
      title="Email Management" 
      description="Monitor and manage email communications"
    >
      <EmailDashboard />
    </AdminLayout>
  );
}