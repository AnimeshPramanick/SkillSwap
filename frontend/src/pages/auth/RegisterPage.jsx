import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const RegisterPage = () => {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    bio: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Clear errors when form data changes
  React.useEffect(() => {
    if (error) {
      clearError();
    }
    setValidationErrors({});
  }, [formData, error, clearError]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters and numbers';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Bio validation (optional but if provided, check length)
    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters';
    }
    
    // Terms agreement
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
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
      // Prepare data for registration
      const { confirmPassword, agreeToTerms, ...userData } = formData;
      await register(userData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration error:', error);
    }
  };

  const passwordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    return score;
  };

  const getPasswordStrengthText = (score) => {
    switch (score) {
      case 0:
      case 1:
        return { text: 'Weak', color: 'text-red-500' };
      case 2:
      case 3:
        return { text: 'Fair', color: 'text-yellow-500' };
      case 4:
        return { text: 'Good', color: 'text-blue-500' };
      case 5:
        return { text: 'Strong', color: 'text-green-500' };
      default:
        return { text: '', color: '' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  const passwordScore = passwordStrength(formData.password);
  const strengthInfo = getPasswordStrengthText(passwordScore);

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
            <h1 className="text-h2 mb-2">Create your account</h1>
            <p className="text-neutral-600">
              Start your skill exchange journey today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
                disabled={loading}
              />
              {validationErrors.name && (
                <div className="form-error">{validationErrors.name}</div>
              )}
            </div>

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

            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`form-input ${validationErrors.username ? 'error' : ''}`}
                placeholder="Choose a username"
                disabled={loading}
              />
              {validationErrors.username && (
                <div className="form-error">{validationErrors.username}</div>
              )}
              <div className="form-help">
                Only letters and numbers. Will be used in your profile URL.
              </div>
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
                  placeholder="Create a password"
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
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-neutral-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordScore <= 2 ? 'bg-red-500' :
                          passwordScore === 3 ? 'bg-yellow-500' :
                          passwordScore === 4 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordScore / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${strengthInfo.color}`}>
                      {strengthInfo.text}
                    </span>
                  </div>
                </div>
              )}
              {validationErrors.password && (
                <div className="form-error">{validationErrors.password}</div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input pr-12 ${validationErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <div className="form-error">{validationErrors.confirmPassword}</div>
              )}
            </div>

            {/* Bio Field (Optional) */}
            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                Bio <span className="text-neutral-400">(Optional)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className={`form-input resize-none ${validationErrors.bio ? 'error' : ''}`}
                placeholder="Tell us a bit about yourself..."
                disabled={loading}
              />
              <div className="flex justify-between">
                {validationErrors.bio && (
                  <div className="form-error">{validationErrors.bio}</div>
                )}
                <div className="text-sm text-neutral-400 ml-auto">
                  {formData.bio.length}/500
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="form-group">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  disabled={loading}
                />
                <span className="text-sm text-neutral-600">
                  I agree to the{' '}
                  <a href="#" className="text-primary-500 hover:text-primary-600">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-500 hover:text-primary-600">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {validationErrors.agreeToTerms && (
                <div className="form-error">{validationErrors.agreeToTerms}</div>
              )}
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
                'Create Account'
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-500 hover:text-primary-600"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image/Info */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex items-center justify-center h-full p-12">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              Start Your Learning Journey
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-md">
              Join a community where knowledge is shared freely and connections are built through skills.
            </p>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Find your perfect skill match</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Schedule learning sessions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Connect with video calls</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Build meaningful relationships</span>
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

export default RegisterPage;