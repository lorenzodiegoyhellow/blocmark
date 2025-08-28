import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

interface SecretCornersAccessWrapperProps {
  children: ReactNode;
}

export function SecretCornersAccessWrapperSimple({ children }: SecretCornersAccessWrapperProps) {
  const { user, isLoading: authLoading } = useAuth();
  
  // Check if user is admin directly
  const isAdmin = user?.roles?.includes('admin') || false;
  
  console.log('[SecretCornersAccessWrapperSimple] User:', user);
  console.log('[SecretCornersAccessWrapperSimple] Is Admin:', isAdmin);
  console.log('[SecretCornersAccessWrapperSimple] Auth Loading:', authLoading);
  
  // If still loading auth, show loading
  if (authLoading) {
    return <div>Loading authentication...</div>;
  }
  
  // If no user, show error
  if (!user) {
    return <div>No user authenticated</div>;
  }
  
  // If admin, show content
  if (isAdmin) {
    console.log('[SecretCornersAccessWrapperSimple] Admin detected - showing content');
    return <>{children}</>;
  }
  
  // Otherwise show access denied
  return <div>Access denied - not an admin</div>;
}