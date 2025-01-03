import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight } from 'lucide-react';
import CustomCheckbox from '../components/addons/CustomCheckbox';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../navigation';

interface LoginButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
}

interface InputWrapperProps {
  label: string;
  icon: JSX.Element;
  children: React.ReactNode;
}

interface InputProps {
  value: string;
  onChange: (value: string) => void;
}

const INPUT_STYLES = `
  block w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg 
  text-white placeholder-slate-500 focus:outline-none focus:ring-2 
  focus:ring-indigo-500 focus:border-transparent
`;

const BUTTON_STYLES = `
  w-full flex items-center justify-center gap-2 px-4 py-2 
  bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg 
  font-medium hover:from-indigo-600 hover:to-purple-700 
  transition-all duration-200 disabled:opacity-50
`;

const InputWrapper: React.FC<InputWrapperProps> = ({ label, icon, children }) => (
  <div className="space-y-2">
    <label htmlFor="email" className="block text-sm font-medium text-slate-400">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      {children}
    </div>
  </div>
);

const EmailInput: React.FC<InputProps> = ({ value, onChange }) => (
  <InputWrapper label="Emailová adresa" icon={<Mail className="h-5 w-5 text-slate-500" />}>
    <input
      type="email"
      id="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={INPUT_STYLES}
      placeholder="jmeno.prijmeni@educanet.cz"
      required
    />
  </InputWrapper>
);

const PasswordInput: React.FC<InputProps> = ({ value, onChange }) => (
  <InputWrapper label="Heslo" icon={<KeyRound className="h-5 w-5 text-slate-500" />}>
    <input
      type="password"
      id="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={INPUT_STYLES}
      placeholder="••••••••"
      required
    />
  </InputWrapper>
);

const LoginButton: React.FC<LoginButtonProps> = ({ isLoading, children }) => (
  <button
    type="submit"
    disabled={isLoading}
    className={BUTTON_STYLES}
  >
    {isLoading ? 'Přihlašování...' : children}
  </button>
);

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      navigate(ROUTES.ROOT);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      {/* Header */}
      <section className="mb-8">
        <Link
          to={ROUTES.ROOT}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all duration-300 mb-6"
        >
          ← Zpět na přehled
        </Link>
      </section>

      {/* Login Form */}
      <section className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Přihlášení</h1>
          <p className="text-slate-400">Přihlaste se pro ukládání svého postupu</p>
        </div>

        <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <EmailInput value={email} onChange={setEmail} />
            <PasswordInput value={password} onChange={setPassword} />

            <div className="flex items-center justify-between">
              <CustomCheckbox 
                checked={rememberMe} 
                onChange={setRememberMe} 
                label="Zapamatovat si mě" 
              />
              <Link 
                to={ROUTES.FORGOT_PASSWORD} 
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Zapomenuté heslo?
              </Link>
            </div>

            <LoginButton isLoading={isLoading}>
              Přihlásit se <ArrowRight className="w-4 h-4" />
            </LoginButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Nemáte účet?{' '}
              <Link 
                to={ROUTES.REGISTER} 
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Zaregistrujte se
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export type { LoginButtonProps, InputWrapperProps, InputProps };
export default Login;