import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldAlert } from "lucide-react";
import { Redirect, Route } from "wouter";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  path?: string;
  component?: () => React.ReactElement | null;
  children?: ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({
  path,
  component: Component,
  children,
  requiredRoles = [],
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Component to render regardless of routing
  const renderProtectedContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      );
    }

    if (!user) {
      return <Redirect to="/auth" />;
    }

    // Check for required roles if specified
    if (requiredRoles.length > 0) {
      const hasRequiredRole = user.roles?.some(role => requiredRoles.includes(role));
      if (!hasRequiredRole) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen text-center max-w-md mx-auto px-4">
            <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have the necessary permissions to access this page.
              {requiredRoles.length === 1 && ` You need the ${requiredRoles[0]} role.`}
            </p>
            <a href="/" className="text-primary hover:underline">
              Return to home page
            </a>
          </div>
        );
      }
    }

    return Component ? <Component /> : children;
  };

  // If used as a route
  if (path && Component) {
    return (
      <Route path={path}>
        {() => renderProtectedContent()}
      </Route>
    );
  }

  // If used as a wrapper
  return <>{renderProtectedContent()}</>;
}