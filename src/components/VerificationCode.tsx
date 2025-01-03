import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { ROUTES } from '../navigation';

interface VerificationFormProps {
  onSubmit: (code: string) => Promise<void>;
  isLoading: boolean;
}

const CODE_LENGTH = 6;
const CODE_VALIDITY_MINUTES = 5;

const BUTTON_STYLES = {
  back: 'inline-flex items-center px-4 py-2 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all duration-300 mb-6',
  submit: `w-full flex items-center justify-center gap-2 px-4 py-2 
    bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg 
    font-medium hover:from-indigo-600 hover:to-purple-700 transition-all 
    duration-200 disabled:opacity-50`,
  resend: 'text-indigo-400 hover:text-indigo-300 font-medium'
} as const;

const INPUT_STYLES = `w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg 
  text-white text-center text-2xl tracking-[1em] font-mono
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`;

const BackButton: React.FC = () => (
  <section className="mb-8">
    <Link to={ROUTES.REGISTER} className={BUTTON_STYLES.back}>
      ← Zpět na registraci
    </Link>
  </section>
);

const PageHeader: React.FC<{ email: string }> = ({ email }) => (
  <div className="text-center mb-8">
    <h1 className="text-2xl font-bold text-white mb-2">Ověřte svůj email</h1>
    <p className="text-slate-400">
      Zadejte {CODE_LENGTH}-místný kód, který jsme poslali na {email}
    </p>
  </div>
);

const MailIcon: React.FC = () => (
  <div className="mb-6 flex justify-center">
    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
      <Mail className="w-8 h-8 text-indigo-400" />
    </div>
  </div>
);

const VerificationForm: React.FC<VerificationFormProps> = ({ onSubmit, isLoading }) => {
  const [code, setCode] = React.useState('');

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/\D/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <input
          type="text"
          maxLength={CODE_LENGTH}
          value={code}
          onChange={handleCodeChange}
          className={INPUT_STYLES}
          placeholder="000000"
          required
        />
        <p className="mt-2 text-sm text-slate-400 text-center">
          Kód má platnost {CODE_VALIDITY_MINUTES} minut
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading || code.length !== CODE_LENGTH}
        className={BUTTON_STYLES.submit}
      >
        {isLoading ? 'Ověřuji...' : (
          <>
            Ověřit kód <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};

const ResendCode: React.FC = () => (
  <div className="mt-6 text-center">
    <p className="text-sm text-slate-400">
      Nedostal jste kód?{' '}
      <button 
        className={BUTTON_STYLES.resend}
      >
        Poslat znovu
      </button>
    </p>
  </div>
);

const VerificationCode: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  React.useEffect(() => {
    if (!email) {
      navigate(ROUTES.REGISTER);
    }
  }, [email, navigate]);

  if (!email) return null;

  const handleVerification = async (code: string) => {
    setIsLoading(true);
    try {
      await verifyOTP(email, code);
      navigate(ROUTES.ROOT);
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <BackButton />
      <section className="max-w-md mx-auto">
        <PageHeader email={email} />
        <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
          <MailIcon />
          <VerificationForm 
            onSubmit={handleVerification}
            isLoading={isLoading}
          />
          <ResendCode />
        </div>
      </section>
    </div>
  );
};

export default VerificationCode;