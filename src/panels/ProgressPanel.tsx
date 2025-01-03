import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface ConfirmationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

interface DeleteButtonProps {
  onClick: () => void;
  isDisabled: boolean;
}

const CONFIRMATION_TEXT = 'SMAZAT' as const;

const STYLES = {
  container: 'space-y-6',
  dangerZone: 'p-6 bg-red-500/10 border border-red-500/20 rounded-xl',
  header: 'flex items-center gap-3 mb-4',
  headerIcon: 'w-5 h-5 text-red-400',
  headerText: 'text-red-400 font-medium',
  content: 'space-y-4',
  description: 'text-slate-400 text-sm',
  input: `
    w-full px-3 py-2 bg-slate-900/50 border border-red-500/20 rounded-lg
    text-red-400 placeholder-red-400/50 focus:outline-none focus:border-red-500
  `,
  button: `
    w-full px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium 
    hover:bg-red-500/20 transition-colors border border-red-500/20
    disabled:opacity-50 disabled:cursor-not-allowed
  `
} as const;

const ConfirmationInput: React.FC<ConfirmationInputProps> = ({ 
  value, 
  onChange, 
  placeholder 
}) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={STYLES.input}
  />
);

const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, isDisabled }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={STYLES.button}
  >
    Smazat všechna data
  </button>
);

const clearAllData = () => {
  localStorage.clear();
  window.location.reload();
};

const ProgressPanel: React.FC = () => {
  const [confirmDelete, setConfirmDelete] = useState('');

  const handleDeleteData = () => {
    if (confirmDelete === CONFIRMATION_TEXT) {
      clearAllData();
    }
  };

  return (
    <div className={STYLES.container}>
      <div className={STYLES.dangerZone}>
        <div className={STYLES.header}>
          <Shield className={STYLES.headerIcon} />
          <span className={STYLES.headerText}>Nebezpečná zóna</span>
        </div>

        <div className={STYLES.content}>
          <p className={STYLES.description}>
            Pro smazání všech dat napište "{CONFIRMATION_TEXT}" do pole níže. Tato akce je nevratná.
          </p>

          <ConfirmationInput
            value={confirmDelete}
            onChange={setConfirmDelete}
            placeholder={CONFIRMATION_TEXT}
          />

          <DeleteButton
            onClick={handleDeleteData}
            isDisabled={confirmDelete !== CONFIRMATION_TEXT}
          />
        </div>
      </div>
    </div>
  );
};

export type { ConfirmationInputProps, DeleteButtonProps };
export default ProgressPanel;