import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';

/**
 * A utility component that monitors navigation to Secret Corners and refreshes 
 * access data to ensure the menu items remain visible.
 * 
 * This helps solve the issue where the Secret Corners menu item would disappear
 * after navigation.
 */
export function RefreshLayoutMonitor() {
  const [location] = useLocation();
  
  useEffect(() => {
    // When navigating to Secret Corners pages, refresh the access data
    // to ensure the menu stays visible
    if (
      location === '/secret-corners' || 
      location.startsWith('/secret-corners/') || 
      location.includes('blocmap')
    ) {
      // Force a refresh of the Secret Corners access data
      // This will re-run any queries that depend on this data
      queryClient.invalidateQueries({ queryKey: ['/api/secret-corners/access'] });
      
      console.log('RefreshLayoutMonitor: Refreshed Secret Corners access data');
    }
  }, [location]);
  
  // This is just a utility component, it doesn't render anything
  return null;
}