import { useAuthContext } from '../contexts/AuthContext';

// Custom hook that wraps the auth context
export const useAuth = () => {
  const context = useAuthContext();
  return context;
};