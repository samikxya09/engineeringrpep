import { useAuth as useAuthFromContext } from "../context/AuthContext";

/**
 * Custom hook to easily access user authentication status and functions.
 */
export const useAuth = () => {
  return useAuthFromContext();
};

export default useAuth;
