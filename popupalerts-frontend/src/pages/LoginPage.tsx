import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      // Wait for login to complete before allowing any further actions
      await login(access_token, user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="flex justify-center items-center gap-2 mb-4">
            <img src="/Logo.svg" alt="Popupalerts" className="h-12 w-12" />
            <span className="text-2xl font-bold text-gray-800">Popupalerts</span>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                Sign in to your account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary disabled:bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary disabled:bg-gray-100"
                />
              </div>
              <div className="flex items-center justify-end">
                  <div className="text-sm">
                      <Link to="/auth/forgot-password" className="font-medium text-brand-primary hover:text-orange-500">
                          Forgot your password?
                      </Link>
                  </div>
              </div>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 font-medium text-white bg-brand-primary rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
        </div>

        <div className="text-sm text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-primary hover:text-orange-500">
                Sign up
            </Link>
        </div>
      </div>
    </div>
  );
}