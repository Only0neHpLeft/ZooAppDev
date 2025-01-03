import { check } from '@tauri-apps/plugin-updater';
import { ask } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';
import { useNotifications } from '../contexts/NotificationContext';

export const useUpdateService = () => {
  const { addNotification } = useNotifications();

  const checkForUpdates = async () => {
    try {
      const update = await check();
      
      if (update?.available) {
        addNotification({
          id: `update-${update.version}`,
          type: 'update',
          title: 'Update Available',
          message: `Version ${update.version} is now available.`,
          version: update.version
        });
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const installAppUpdate = async () => {
    try {
      const update = await check();
      
      if (update?.available) {
        const shouldUpdate = await ask(
          `Do you want to install version ${update.version}?\n\n${update.body}`,
          {
            title: 'Install Update',
            kind: 'info'
          }
        );

        if (shouldUpdate) {
          await update.downloadAndInstall();
          await relaunch();
        }
      }
    } catch (error) {
      console.error('Failed to install update:', error);
      addNotification({
        id: 'update-failed',
        type: 'warning',
        title: 'Update Failed',
        message: 'Failed to install the update. Please try again later.'
      });
    }
  };

  return { checkForUpdates, installAppUpdate };
};