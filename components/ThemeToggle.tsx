"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
      style={{
        backgroundColor: resolvedTheme === "dark" 
          ? "rgba(139, 92, 246, 0.3)" 
          : "rgba(251, 191, 36, 0.3)"
      }}
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300"
        style={{
          backgroundColor: resolvedTheme === "dark" ? "#1e1b4b" : "#fef3c7",
          transform: resolvedTheme === "dark" ? "translateX(4px)" : "translateX(28px)",
          boxShadow: resolvedTheme === "dark"
            ? "0 0 10px rgba(139, 92, 246, 0.5)"
            : "0 0 10px rgba(251, 191, 36, 0.5)"
        }}
      >
        {resolvedTheme === "dark" ? (
          <svg className="h-3.5 w-3.5 text-violet-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </span>
    </button>
  );
}
