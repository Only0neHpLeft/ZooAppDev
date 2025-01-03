import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, User, ArrowRight } from 'lucide-react';
import CustomCheckbox from '../components/addons/CustomCheckbox';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from  '../navigation';

interface RegisterButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
}

interface InputWrapperProps {
  label: string;
  icon: JSX.Element;
  children: React.ReactNode;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const REQUIRED_EMAIL_DOMAIN = '@educanet.cz';

const ERROR_MESSAGES = {
  TERMS: 'Musíte souhlasit s podmínkami použití',
  PASSWORDS_MISMATCH: 'Hesla se neshodují',
  INVALID_EMAIL: `Lze použít pouze email s doménou ${REQUIRED_EMAIL_DOMAIN}`
} as const;

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
    <label 
      htmlFor={label.toLowerCase().replace(/\s+/g, '-')} 
      className="block text-sm font-medium text-slate-400"
    >
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

const RegisterButton: React.FC<RegisterButtonProps> = ({ isLoading, children }) => (
  <button
    type="submit"
    disabled={isLoading}
    className={BUTTON_STYLES}
  >
    {isLoading ? 'Registrace...' : children}
  </button>
);

const validateForm = (formData: FormData, acceptTerms: boolean): string | null => {
  if (!acceptTerms) {
    return ERROR_MESSAGES.TERMS;
  }
  if (formData.password !== formData.confirmPassword) {
    return ERROR_MESSAGES.PASSWORDS_MISMATCH;
  }
  if (!formData.email.endsWith(REQUIRED_EMAIL_DOMAIN)) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  return null;
};

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validationError = validateForm(formData, acceptTerms);
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const { email } = await signUp(formData.email, formData.password, formData.username);
      navigate(ROUTES.VERIFY_EMAIL, { state: { email } });
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      {/* Header */}
      <section className="mb-8">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all duration-300 mb-6"
        >
          ← Zpět na přihlášení
        </Link>
      </section>

      {/* Register Form */}
      <section className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Vytvořit účet</h1>
          <p className="text-slate-400">Zaregistrujte se pro ukládání svého postupu</p>
        </div>

        <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <InputWrapper label="Uživatelské jméno" icon={<User className="h-5 w-5 text-slate-500" />}>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={INPUT_STYLES}
                placeholder="Jméno Příjmení"
                required
              />
            </InputWrapper>

            {/* Email Input */}
            <InputWrapper label="Emailová adresa" icon={<Mail className="h-5 w-5 text-slate-500" />}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={INPUT_STYLES}
                placeholder="jmeno.prijmeni@educanet.cz"
                required
              />
            </InputWrapper>

            {/* Password Input */}
            <InputWrapper label="Heslo" icon={<KeyRound className="h-5 w-5 text-slate-500" />}>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={INPUT_STYLES}
                placeholder="••••••••"
                required
              />
            </InputWrapper>

            {/* Confirm Password Input */}
            <InputWrapper label="Potvrzení hesla" icon={<KeyRound className="h-5 w-5 text-slate-500" />}>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={INPUT_STYLES}
                placeholder="••••••••"
                required
              />
            </InputWrapper>

            {/* Terms Checkbox */}
            <div className="flex items-center">
              <CustomCheckbox
                checked={acceptTerms}
                onChange={setAcceptTerms}
                label={
                  <span className="text-sm text-slate-400">
                    Souhlasím s{' '}
                    <button type="button" className="text-indigo-400 hover:text-indigo-300">
                      podmínkami použití
                    </button>
                  </span>
                }
                required
              />
            </div>

            <RegisterButton isLoading={isLoading}>
              Vytvořit účet <ArrowRight className="w-4 h-4" />
            </RegisterButton>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Již máte účet?{' '}
              <Link 
                to={ROUTES.LOGIN} 
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Přihlásit se
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export type { RegisterButtonProps, InputWrapperProps, FormData };
export default Register;