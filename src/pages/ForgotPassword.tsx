import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { ROUTES } from '../navigation'

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface ResetButtonProps {
  children: React.ReactNode;
}

const INPUT_STYLES = 'block w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
const BUTTON_STYLES = 'w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200';
const BACK_LINK_STYLES = 'inline-flex items-center px-4 py-2 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all duration-300 mb-6';

const EmailInput: React.FC<EmailInputProps> = ({ value, onChange }) => (
  <div className="space-y-2">
    <label htmlFor="email" className="block text-sm font-medium text-slate-400">
      Emailová adresa
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Mail className="h-5 w-5 text-slate-500" />
      </div>
      <input
        type="email"
        id="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_STYLES}
        placeholder="jmeno.prijmeni@educanet.cz"
        required
      />
    </div>
  </div>
);

const ResetButton: React.FC<ResetButtonProps> = ({ children }) => (
  <button type="submit" className={BUTTON_STYLES}>
    {children}
  </button>
);

const ResetConfirmation: React.FC = () => (
  <div className="text-center py-4">
    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
      <Mail className="w-6 h-6 text-emerald-400" />
    </div>
    <h3 className="text-lg font-medium text-white mb-2">
      Email odeslán
    </h3>
    <p className="text-slate-400 mb-6">
      Pokud účet existuje, poslali jsme vám email s instrukcemi pro obnovení hesla.
    </p>
    <Link 
      to={ROUTES.LOGIN} 
      className="text-indigo-400 hover:text-indigo-300 font-medium"
    >
      Zpět na přihlášení
    </Link>
  </div>
);

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetSent(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      {/* Header */}
      <section className="mb-8">
        <Link to={ROUTES.LOGIN} className={BACK_LINK_STYLES}>
          ← Zpět na přihlášení
        </Link>
      </section>

      {/* Forgot Password Form */}
      <section className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Zapomenuté heslo
          </h1>
          <p className="text-slate-400">
            Zadejte svůj email a my vám pošleme instrukce k obnovení hesla
          </p>
        </div>

        <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
          {!resetSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <EmailInput 
                value={email} 
                onChange={setEmail} 
              />
              <ResetButton>
                Obnovit heslo <ArrowRight className="w-4 h-4" />
              </ResetButton>
            </form>
          ) : (
            <ResetConfirmation />
          )}
        </div>
      </section>
    </div>
  );
};

export type { EmailInputProps, ResetButtonProps };
export default ForgotPassword;