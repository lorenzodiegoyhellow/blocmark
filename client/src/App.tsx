import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { HostModeProvider } from "./hooks/use-host-mode";
import { TranslationProvider } from "./hooks/use-translation";
import { StripeProvider } from "./lib/stripe-context";
import { IntercomProvider } from "./lib/intercom-provider";
import { Toaster } from "./components/ui/toaster";
import { ProtectedRoute } from "./lib/protected-route";
import { RefreshLayoutMonitor } from "./components/secret-corners/refresh-layout-monitor";
import { useEffect } from "react";
import React from "react";
import NotFound from "./pages/not-found";
import AuthPage from "./pages/auth-page";
import HomePage from "./pages/home-page";
import LocationDetails from "./pages/location-details";
import BasicLocationDetails from "./pages/location-details-new";
import Dashboard from "./pages/dashboard";
import DashboardNew from "./pages/dashboard-new";
import ClientDashboardNew from "./pages/client-dashboard-new";
import MessagesPage from "./pages/messages-page";
import ListingsPage from "./pages/listings-page";
import AddListingPage from "./pages/add-listing-page";
import LocationAddons from "./pages/location-addons";
import BookingDetails from "./pages/booking-details";
import BookingSummary from "./pages/booking-summary";
import DirectBookingPage from "./pages/direct-booking";
import SimpleBookingSummary from "./pages/simple-booking-summary";
import UserProfileNew from "./pages/user-profile-new";
import AccountSettings from "./pages/account-settings";
import SavedLocationsPage from "./pages/saved-locations";
import HelpSupportPage from "./pages/help-support";
import SearchResultsPage from "./pages/search-results";
import AISearchResultsPage from "./pages/ai-search-results";
import AISearchResultsNew from "./pages/ai-search-results-new";
import SimpleSearchResults from "./pages/simple-search-results";
import HostLandingPage from "./pages/host-landing-page";
import SecretCornersPage from "./pages/secret-corners";
import SecretSubmissionTest from "./pages/secret-submission-test";
import SecretSubmitPage from "./pages/secret-submit";
import SecretLocationDetails from "./pages/secret-location-details";
import SecretCornersLanding from "./pages/secret-corners-landing";
import SecretCornersApply from "./pages/secret-corners-apply";
import SecretCornersFixed from "./pages/secret-corners-fixed";
import SecretCornersFixedUpdated from "./pages/secret-corners-fixed-updated";
import { SecretCornersRoute } from "./components/secret-corners/secret-corners-route";
import SecretCornersBasic from "./pages/secret-corners-basic";
import SecretCornersEnhanced from "./pages/secret-corners-enhanced";
import SecretCornersImproved from "./pages/secret-corners-improved";
import SecretCornersSimple from "./pages/secret-corners-simple";
import SecretCornersMinimal from "./pages/secret-corners-minimal";
import ConciergePage from "./pages/concierge-page";

import FAQPage from "./pages/faq";
import CommunityPage from "./pages/community";
import GuidelinesPage from "./pages/guidelines";
import TrustSafetyPage from "./pages/trust-safety";
import AboutPage from "./pages/about";
import BlogPage from "./pages/blog";
import BlogArticlePage from "./pages/blog-article";
import GuidesPage from "./pages/guides";
import GuideCategoryPage from "./pages/guide-category";
import GuideArticlePage from "./pages/guide-article";
import TermsPage from "./pages/terms";
import PrivacyPage from "./pages/privacy";
import SitemapPage from "./pages/sitemap";
import AccessibilityPage from "./pages/accessibility";
import AnalyticsDashboard from "./pages/analytics-dashboard";
import ImageUploadTestPage from "./pages/image-upload-test";

import BookingSuccessPage from "./pages/booking-success";
import PaymentLinkPage from "./pages/payment-link";
import SimplePayment from "./pages/simple-payment";
import PaymentConfirmation from "./pages/payment-confirmation";
import BookingCheckout from "./pages/booking-checkout";
import BookingCheckoutSimple from "./pages/booking-checkout-simple";
import TestMaintenancePage from "./pages/test-maintenance";
import { ReportUserPage } from "./pages/report-user";
import HostBookingDetailsPage from "./pages/host-booking-details-basic";
import HostBookingDetailsNew from "./pages/host-booking-details-new";
import ClientBookingDetailsPage from "./pages/client-booking-details";
import AdminDashboard from "./pages/admin/dashboard";
import SecurityPage from "./pages/admin/security";
import DebugApplications from "./pages/admin/debug-applications";
import AdminEmailsPage from "./pages/admin-emails";
import { TestCalendar } from "./pages/test-calendar";


function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/search" component={SearchResultsPage} />
        <Route path="/search-results" component={SearchResultsPage} />
        <Route path="/ai-search" component={AISearchResultsPage} />
        <Route path="/ai-search-results" component={AISearchResultsPage} />
        <Route path="/ai-search-new" component={AISearchResultsNew} />
        <Route path="/simple-search" component={SimpleSearchResults} />
        <Route path="/simple-search-results" component={SimpleSearchResults} />
        <Route path="/host" component={HostLandingPage} />
        <Route path="/locations/:id" component={BasicLocationDetails} />
        <Route path="/locations-old/:id" component={LocationDetails} />
        <Route path="/locations/:id/booking-details" component={BookingDetails} />
        <Route path="/locations/:id/booking-summary" component={BookingSummary} />
        <Route path="/locations/:id/direct-booking" component={DirectBookingPage} />
        <Route path="/locations/:id/simple-booking" component={SimpleBookingSummary} />
        <Route path="/locations/:id/payment" component={SimplePayment} />
        <Route path="/locations/:id/booking-checkout" component={BookingCheckout} />
        <Route path="/booking-checkout" component={BookingCheckout} />
        <Route path="/locations/:id/booking-checkout-simple" component={BookingCheckoutSimple} />
        <Route path="/booking-success" component={BookingSuccessPage} />
        <Route path="/payment-success" component={BookingSuccessPage} />
        <Route path="/payment-confirmation/:bookingId" component={PaymentConfirmation} />
        <Route path="/users/:id" component={UserProfileNew} />
        <Route path="/payment-link/:checkoutUrl" component={PaymentLinkPage} />
        <Route path="/host/bookings/:id" component={HostBookingDetailsPage} />
        <Route path="/host-booking/:id" component={HostBookingDetailsPage} />
        <Route path="/bookings/host/:id" component={HostBookingDetailsNew} />
        <ProtectedRoute path="/bookings/:id" component={ClientBookingDetailsPage} />
        
        {/* Support Pages */}
        <Route path="/faq" component={FAQPage} />
        <Route path="/community" component={CommunityPage} />
        <Route path="/guidelines" component={GuidelinesPage} />
        <Route path="/trust-safety" component={TrustSafetyPage} />
        
        {/* Company Pages */}
        <Route path="/about" component={AboutPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:id" component={BlogArticlePage} />
        <Route path="/guides" component={GuidesPage} />
        <Route path="/guides/category/:category" component={GuideCategoryPage} />
        <Route path="/guide/:id" component={GuideArticlePage} />
        
        {/* Footer Links */}
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/sitemap" component={SitemapPage} />
        <Route path="/accessibility" component={AccessibilityPage} />
        
        {/* Protected Routes */}
        <ProtectedRoute path="/account-settings" component={AccountSettings} />
        <ProtectedRoute path="/listings/:id/addons" component={LocationAddons} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/dashboard-new" component={DashboardNew} />
        <ProtectedRoute path="/client-dashboard-new" component={ClientDashboardNew} />
        <ProtectedRoute path="/messages" component={MessagesPage} />
        <ProtectedRoute path="/listings" component={ListingsPage} />
        <ProtectedRoute path="/add-listing" component={AddListingPage} />
        <ProtectedRoute path="/saved-locations" component={SavedLocationsPage} />
        <ProtectedRoute path="/help-support" component={HelpSupportPage} />
        <ProtectedRoute path="/analytics" component={AnalyticsDashboard} />
        <ProtectedRoute path="/admin" component={AdminDashboard} />
        <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
        <ProtectedRoute path="/admin/security" component={SecurityPage} />
        <ProtectedRoute path="/admin/emails" component={AdminEmailsPage} />
        <ProtectedRoute path="/admin/debug-applications" component={DebugApplications} />
        <Route path="/secret-corners-landing" component={SecretCornersLanding} />
        <Route path="/secret-corners-apply" component={SecretCornersApply} />
        <Route path="/secret-corners" component={SecretCornersRoute} />
        <Route path="/secret-corners-enhanced" component={SecretCornersEnhanced} />
        <Route path="/secret-corners-improved" component={SecretCornersImproved} />
        <Route path="/secret-corners-simple" component={SecretCornersSimple} />
        <Route path="/secret-corners-minimal" component={SecretCornersMinimal} />
        <Route path="/secret-corners-updated" component={SecretCornersFixedUpdated} />
        <Route path="/concierge" component={ConciergePage} />
        <Route path="/secret-submission-test" component={SecretSubmissionTest} />
        <Route path="/secret-corners-original" component={SecretCornersPage} />
        <Route path="/secret-submit" component={SecretSubmitPage} />
        <Route path="/secret-location-details/:id" component={SecretLocationDetails} />
        <Route path="/image-upload-test" component={ImageUploadTestPage} />
        <ProtectedRoute path="/report-user/:userId" component={ReportUserPage} />
        <Route path="/test-calendar" component={TestCalendar} />
        <Route path="/test-maintenance" component={TestMaintenancePage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  // Get Intercom App ID from environment variable or use the default
  const intercomAppId = import.meta.env.VITE_INTERCOM_APP_ID || 'j8m5309i';
  const intercomEnabled = !!intercomAppId && import.meta.env.VITE_INTERCOM_ENABLED !== 'false';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HostModeProvider>
          <TranslationProvider>
            <StripeProvider>
              <IntercomProvider 
                appId={intercomAppId} 
                enabled={intercomEnabled}
              >
                <RefreshLayoutMonitor />
                <Router />
                <Toaster />
              </IntercomProvider>
            </StripeProvider>
          </TranslationProvider>
        </HostModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;