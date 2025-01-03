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
      title="Nový verze k dispozici"
      message={`Verze ${version} je nyní k dispozici s novými funkcemi a technickým laděním.`}
      icon={<Download className="w-5 h-5 text-indigo-400" />}
      onClose={onClose}
      onAction={handleInstall}
      actionLabel="Update"
      variant="indigo"
    />
  );
};