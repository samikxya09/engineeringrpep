import { useTheme as useThemeFromContext } from "../context/ThemeContext";

/**
 * Custom hook to easily access and toggle application theme.
 */
export const useTheme = () => {
  return useThemeFromContext();
};

export default useTheme;
