import { useState, useEffect } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { UsersList } from "@/components/admin/users-list";
import { LocationsList } from "@/components/admin/locations-list";
import { BookingsList } from "@/components/admin/bookings-list";
import { ConversationsList } from "@/components/admin/conversations-list";
import { AdminLogs } from "@/components/admin/admin-logs";
import { SpotlightManagerSimple } from "@/components/admin/spotlight-manager-simple";
import { BlogManager } from "@/components/admin/blog-manager";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import BasicSecretLocationsManager from "@/components/admin/basic-secret-locations-manager";
import SecretCornersApplicationsManager from "@/components/admin/secret-corners-applications-manager";
import DirectApplicationsViewer from "@/components/admin/direct-applications-viewer";
import SecretCornersComprehensiveManager from "@/components/admin/secret-corners-comprehensive-manager";
import { ReportsList } from "@/components/admin/reports-list";
import { ConciergeRequests } from "@/components/admin/concierge-requests";
import { SupportEmails } from "@/components/admin/support-emails";
import { GuidesManager } from "@/components/admin/guides-manager";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/lib/protected-route";
import { 
  Users, 
  Map, 
  Calendar, 
  MessageSquare, 
  ClipboardList,
  Shield,
  Home,
  Sparkles,
  FileText,
  Compass,
  BarChart2,
  AlertTriangle,
  Headphones,
  Mail,
  Book
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [, navigate] = useLocation();
  
  // Check URL for tab parameter
  const getTabFromURL = () => {
    try {
      if (location.includes('?')) {
        const params = new URLSearchParams(location.split('?')[1]);
        const tabParam = params.get('tab');
        if (tabParam && ['users', 'locations', 'bookings', 'spotlight', 'secret-corners', 'blog', 'guides', 'conversations', 'concierge', 'support', 'logs', 'analytics', 'reports'].includes(tabParam)) {
          return tabParam;
        }
      }
      return "users"; // Default tab
    } catch (e) {
      console.error("Error parsing URL params:", e);
      return "users";
    }
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromURL());

  // Redirect non-admin/non-editor users back to home page after loading
  useEffect(() => {
    if (user && user.roles && !user.roles.includes("admin") && !user.roles.includes("editor")) {
      navigate("/");
    }
  }, [user, navigate]);

  // Loading state while checking authorization
  if (user === null) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  // Check if the user has admin or editor role
  const isAdmin = user?.roles && user.roles.includes("admin");
  const isEditor = user?.roles && user.roles.includes("editor");
  const hasAccess = isAdmin || isEditor;
  
  // Get editor permissions if user is an editor
  const editorPermissions = isEditor ? (user.editorPermissions || {}) : null;
  
  // Function to check if a tab is accessible
  const canAccessTab = (tab: string) => {
    if (isAdmin) return true; // Admin can access everything
    if (!isEditor) return false; // Not an editor, no access
    
    // Map tab names to permission keys
    const tabPermissionMap: Record<string, string> = {
      'users': 'users',
      'locations': 'locations',
      'bookings': 'bookings',
      'spotlight': 'spotlight',
      'secret-corners': 'secretCorners',
      'blog': 'blog',
      'guides': 'guides',
      'conversations': 'conversations',
      'concierge': 'concierge',
      'support': 'support',
      'logs': 'logs',
      'analytics': 'analytics',
      'reports': 'reports'
    };
    
    const permissionKey = tabPermissionMap[tab];
    return editorPermissions?.[permissionKey] === true;
  };
  
  // Get first accessible tab for editors
  const getDefaultTab = () => {
    const tabs = ['users', 'locations', 'bookings', 'spotlight', 'secret-corners', 'blog', 'guides', 'conversations', 'concierge', 'support', 'logs', 'analytics', 'reports'];
    if (isAdmin) return getTabFromURL() || 'users';
    
    const urlTab = getTabFromURL();
    if (urlTab && canAccessTab(urlTab)) return urlTab;
    
    // Find first accessible tab for editor
    for (const tab of tabs) {
      if (canAccessTab(tab)) return tab;
    }
    return 'users'; // Fallback
  };
  
  // Set initial tab based on permissions
  useEffect(() => {
    const defaultTab = getDefaultTab();
    if (activeTab !== defaultTab && !canAccessTab(activeTab)) {
      setActiveTab(defaultTab);
    }
  }, [user]);
  
  if (!hasAccess) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-500">
              <Shield className="w-12 h-12 mx-auto mb-2" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-center text-base">
              You do not have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Return to Homepage
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'editor']}>
      <AdminLayout 
        title={isAdmin ? "Admin Dashboard" : "Editor Dashboard"}
        description={isAdmin ? "Manage users, locations, bookings, and monitor platform activity" : "Manage assigned sections"}
      >
        <div className="mt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Responsive tabs layout - scroll on mobile, wrap on larger screens */}
          <div className="w-full overflow-x-auto">
            <TabsList className="bg-muted/50 p-1 w-full min-w-max admin-tabs-list">
              {canAccessTab('users') && (
                <TabsTrigger value="users" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
              )}
              {canAccessTab('locations') && (
                <TabsTrigger value="locations" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <Map className="h-4 w-4 mr-2" />
                  Locations
                </TabsTrigger>
              )}
              {canAccessTab('bookings') && (
                <TabsTrigger value="bookings" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <Calendar className="h-4 w-4 mr-2" />
                  Bookings
                </TabsTrigger>
              )}
              {canAccessTab('spotlight') && (
                <TabsTrigger value="spotlight" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Spotlight
                </TabsTrigger>
              )}
              {canAccessTab('secret-corners') && (
                <TabsTrigger value="secret-corners" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <Compass className="h-4 w-4 mr-2" />
                  Secret Corners
                </TabsTrigger>
              )}
              {canAccessTab('blog') && (
                <TabsTrigger value="blog" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <FileText className="h-4 w-4 mr-2" />
                  Blog
                </TabsTrigger>
              )}
              {canAccessTab('guides') && (
                <TabsTrigger value="guides" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <Book className="h-4 w-4 mr-2" />
                  Guides
                </TabsTrigger>
              )}
              {canAccessTab('conversations') && (
                <TabsTrigger value="conversations" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
              )}
              {canAccessTab('concierge') && (
                <TabsTrigger value="concierge" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <Headphones className="h-4 w-4 mr-2" />
                  Concierge
                </TabsTrigger>
              )}
              {canAccessTab('support') && (
                <TabsTrigger value="support" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <Mail className="h-4 w-4 mr-2" />
                  Support
                </TabsTrigger>
              )}
              {canAccessTab('analytics') && (
                <TabsTrigger value="analytics" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
              )}
              {canAccessTab('reports') && (
                <TabsTrigger value="reports" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Reports
                </TabsTrigger>
              )}
              {canAccessTab('logs') && (
                <TabsTrigger value="logs" className="data-[state=active]:bg-background flex items-center admin-tab-trigger">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Logs
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="users" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage user accounts, update statuses, and monitor user activities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Location Management</CardTitle>
                <CardDescription>
                  Review and approve locations, manage listings, and handle moderation tasks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LocationsList />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="secret-corners" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Secret Corners Management</CardTitle>
                <CardDescription>
                  Review access applications, manage content, and moderate the Secret Corners community.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="applications" className="w-full">
                  <div className="px-6 mt-6">
                    <TabsList className="w-full grid grid-cols-4 mb-4">
                      <TabsTrigger value="applications">Access Applications</TabsTrigger>
                      <TabsTrigger value="locations">Secret Locations</TabsTrigger>
                      <TabsTrigger value="community">Community Management</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics & Features</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="applications" className="mt-0">
                    <div className="px-6 pb-6">
                      <DirectApplicationsViewer />
                    </div>
                  </TabsContent>
                  <TabsContent value="locations" className="mt-0 px-6 pb-6">
                    <BasicSecretLocationsManager />
                  </TabsContent>
                  <TabsContent value="community" className="mt-0 px-6 pb-6">
                    <SecretCornersComprehensiveManager />
                  </TabsContent>
                  <TabsContent value="analytics" className="mt-0 px-6 pb-6">
                    <SecretCornersComprehensiveManager />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spotlight" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Spotlight Management</CardTitle>
                <CardDescription>
                  Manage locations featured in the "In the Spotlight" section on the homepage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SpotlightManagerSimple />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>
                  Monitor bookings, handle disputes, and process refunds when necessary.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blog" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Blog Management</CardTitle>
                <CardDescription>
                  Create, edit, delete, and reorder blog articles. Set featured articles and manage content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlogManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Guides Management</CardTitle>
                <CardDescription>
                  Create, edit, and manage educational guides for users. Organize content by categories and track engagement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GuidesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Monitoring</CardTitle>
                <CardDescription>
                  Monitor user conversations to prevent off-platform bookings and ensure platform guidelines are followed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConversationsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concierge" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Concierge Requests</CardTitle>
                <CardDescription>
                  Manage premium venue requests submitted through the exclusive concierge service.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConciergeRequests />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Support Emails</CardTitle>
                <CardDescription>
                  Manage and respond to support requests submitted through the help/support page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SupportEmails />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Admin Activity Logs</CardTitle>
                <CardDescription>
                  View a record of all administrative actions taken on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminLogs />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="p-0">
            <Card>
              <CardContent className="pt-6">
                <AnalyticsDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>User Reports</CardTitle>
                <CardDescription>
                  Review and manage user reports, including complaints about inappropriate behavior, fake profiles, and policy violations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportsList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}