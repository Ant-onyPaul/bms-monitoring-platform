import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import PrimaryButton from '../components/PrimaryButton';
import { FiMail } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // In a real app we'd call supabase.auth.signInWithPassword

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);

    // Simulate small API delay to show off the button loading state
    setTimeout(() => {
      // For V1 dev, bypass real auth if using VITE_MOCK_AUTH
      if (import.meta.env.VITE_MOCK_AUTH === 'true') {
         navigate('/admin/dashboard');
      } else {
         alert("Supabase integration not fully connected yet. Use VITE_MOCK_AUTH=true");
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-brand-green/30">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-green/10 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-brand-green/5 blur-[100px]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <div className="flex justify-center mb-6">
          <span className="text-3xl font-extrabold text-brand-green tracking-wide">SHADE ENERGY</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          System Authentication
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Secure access to the BMS monitoring dashboard
        </p>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-10 px-6 sm:px-12 animate-slide-up-fade">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            <InputField
              id="email"
              label="Email Address"
              type="email"
              icon={FiMail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autocomplete="username"
            />

            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autocomplete="current-password"
            />

            <div className="pt-4">
              <PrimaryButton isLoading={isLoading}>
                Authorize Access
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
