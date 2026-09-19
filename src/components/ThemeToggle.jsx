import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`btn-secondary w-9 h-9 !p-0 inline-flex items-center justify-center rounded-[10px] text-[#6B6B6B] hover:text-[#333333] dark:text-[#9E9E9E] dark:hover:text-[#EDEDED] transition-colors ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#333333] transition-transform duration-200" />
      )}
    </button>
  );
};

export default ThemeToggle;
