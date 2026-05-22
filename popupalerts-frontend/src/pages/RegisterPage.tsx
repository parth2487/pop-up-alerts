import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/auth/register', { name, email, password });
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/auth/check-email'); // Arahkan ke halaman "Check Email"
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6">
        {/* Logo & Nama Merek */}
        <div className="flex justify-center items-center gap-2 mb-4">
            <img src="/Logo.svg" alt="Popupalerts" className="h-12 w-12" />
            <span className="text-2xl font-bold text-gray-800">Popupalerts</span>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                Create your account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
              
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              
              <div>
                <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-brand-primary rounded-md hover:opacity-90 transition-opacity">
                    Create Account
                </button>
              </div>
            </form>
        </div>

        {/* Tautan ke Halaman Login */}
        <div className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-primary hover:text-orange-500">
                Sign in
            </Link>
        </div>
      </div>
    </div>
  );
}
