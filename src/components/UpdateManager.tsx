import { useEffect } from 'react';
import { useUpdateService } from '../services/update';

export const UpdateManager = () => {
  const { checkForUpdates } = useUpdateService();

  useEffect(() => {
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkForUpdates]);

  return null;
};