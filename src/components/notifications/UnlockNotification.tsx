import { Unlock } from 'lucide-react';
import { BaseNotification } from './BaseNotification';

interface UnlockNotificationProps {
  categoryLetter: string;
  onClose: () => void;
}

export const UnlockNotification: React.FC<UnlockNotificationProps> = ({
  categoryLetter,
  onClose
}) => {
  return (
    <BaseNotification
      id={`unlock-${categoryLetter}`}
      title={`Kategorie ${categoryLetter} Odemčena`}
      message="Nová kategorie úkolů je nyní k dispozici!"
      icon={<Unlock className="w-5 h-5 text-yellow-400" />}
      onClose={onClose}
      variant="yellow"
    />
  );
};