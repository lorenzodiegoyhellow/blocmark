import { useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export function TestNotificationClear() {
  useEffect(() => {
    const testClear = async () => {
      try {
        console.log('Testing notification clearing for user 21, location 26');
        const result = await apiRequest({
          url: '/api/notifications/messages/read/21/26',
          method: 'PATCH'
        });
        console.log('Notification clear result:', result);
      } catch (error) {
        console.error('Failed to clear notifications:', error);
      }
    };
    
    testClear();
  }, []);
  
  return <div>Testing notification clear - check console</div>;
}