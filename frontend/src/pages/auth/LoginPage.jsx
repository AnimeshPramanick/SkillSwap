import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const LoginPage = () => {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/dashboard';

  // Clear errors when form data changes
  React.useEffect(() => {
    if (error) {
      clearError();
    }
    setValidationErrors({});
  }, [formData, error, clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">SS</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900">SkillSwap</span>
            </Link>
            <h1 className="text-h2 mb-2">Welcome back</h1>
            <p className="text-neutral-600">
              Sign in to continue your skill exchange journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                disabled={loading}
              />
              {validationErrors.email && (
                <div className="form-error">{validationErrors.email}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input pr-12 ${validationErrors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <div className="form-error">{validationErrors.password}</div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-neutral-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-primary-500 hover:text-primary-600"
                disabled={loading}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                'Sign In'
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-500 hover:text-primary-600"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <h3 className="text-sm font-medium text-primary-800 mb-2">
              Demo Credentials
            </h3>
            <div className="text-sm text-primary-700 space-y-1">
              <div><strong>Email:</strong> demo@skillswap.com</div>
              <div><strong>Password:</strong> DemoPass123!</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  email: 'demo@skillswap.com',
                  password: 'DemoPass123!'
                });
              }}
              className="mt-2 text-xs text-primary-600 hover:text-primary-700 underline"
              disabled={loading}
            >
              Use demo credentials
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Image/Info */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex items-center justify-center h-full p-12">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              Join the Skill Exchange Revolution
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-md">
              Connect with thousands of people ready to share knowledge and learn new skills together.
            </p>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-sm opacity-80">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">50K+</div>
                <div className="text-sm opacity-80">Skills Shared</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">25K+</div>
                <div className="text-sm opacity-80">Sessions Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">4.9★</div>
                <div className="text-sm opacity-80">User Rating</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
      </div>
    </div>
  );
};

export default LoginPage;