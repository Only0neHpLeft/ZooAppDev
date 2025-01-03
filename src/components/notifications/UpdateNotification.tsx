import { Download } from 'lucide-react';
import { BaseNotification } from './BaseNotification';
import { useUpdateService } from '../../services/update';

interface UpdateNotificationProps {
  version: string;
  onClose: () => void;
  onInstall?: () => void;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  version,
  onClose
}) => {
  const { installAppUpdate } = useUpdateService();

  const handleInstall = async () => {
    await installAppUpdate();
    onClose();
  };

  return (
    <BaseNotification
      title="Update Available"
      message={`Version ${version} is now available with new features and improvements.`}
      icon={<Download className="w-5 h-5 text-indigo-400" />}
      onClose={onClose}
      onAction={handleInstall}
      actionLabel="Install"
      variant="indigo"
    />
  );
};