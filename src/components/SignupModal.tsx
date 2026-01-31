import { useState } from 'react';
import { completeSignUp, signInWithProvider } from '../utils/api';
import { X } from 'lucide-react';


interface SignupModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function SignupModal({ onClose, onSuccess, onSwitchToLogin }: SignupModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await completeSignUp(email, password, name);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setError('');
    setOauthLoading(provider);
    try {
      await signInWithProvider(provider);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-gray-900">Create Account</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <div className="space-y-4">
          <div className="flex items-center gap-3 my-2">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500">or</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  minLength={6}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              {oauthLoading === 'google' ? (
                'Redirecting...'
              ) : (
                <>
                  <span className="flex items-center justify-center w-5 h-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="w-4 h-4" aria-hidden>
                      <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.3h146.9c-6.3 34.2-25.1 63.1-53.6 82.3v68.2h86.5c50.6-46.6 81.7-115.4 81.7-195.4z"/>
                      <path fill="#34A853" d="M272 544.3c72.6 0 133.6-24.1 178.1-65.5l-86.5-68.2c-24.1 16.2-55.1 25.8-91.6 25.8-70.4 0-130-47.6-151.3-111.6H33.5v69.9C77.9 482.3 167.4 544.3 272 544.3z"/>
                      <path fill="#FBBC05" d="M120.7 323.8c-10.9-32.8-10.9-68 0-100.8V153.1H33.5c-39 76.6-39 167.6 0 244.2l87.2-73.5z"/>
                      <path fill="#EA4335" d="M272 107.7c38.9 0 73.9 13.4 101.4 39.5l76-76C403.2 24.6 344.1 0 272 0 167.4 0 77.9 62 33.5 153.1l87.2 69.9C142 155.3 201.6 107.7 272 107.7z"/>
                    </svg>
                  </span>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleOAuth('facebook')}
              disabled={!!oauthLoading}
              className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              {oauthLoading === 'facebook' ? (
                'Redirecting...'
              ) : (
                <>
                  <span className="flex items-center justify-center w-5 h-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
                      <path fill="#1877F2" d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.325 24H12.82v-9.294H9.692V11.01h3.128V8.414c0-3.1 1.893-4.788 4.66-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.716-1.796 1.765v2.316h3.59l-.467 3.696h-3.123V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0z"/>
                      <path fill="#fff" d="M16.671 24v-9.294h3.123l.467-3.696h-3.59V8.694c0-1.049.292-1.765 1.796-1.765l1.918-.001V3.688c-.331-.044-1.47-.143-2.795-.143-2.767 0-4.66 1.688-4.66 4.788v2.596H9.692v3.696h3.128V24z"/>
                    </svg>
                  </span>
                  <span>Continue with Facebook</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button onClick={onSwitchToLogin} className="text-orange-600 hover:underline">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
