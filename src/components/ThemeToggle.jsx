import { useEffect, useState } from "react";

const THEME_KEY = "registroExamenTheme";

function getInitialTheme() {
  try {
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const nextTheme = theme === "light" ? "dark" : "light";
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // The current page can still use the selected theme if storage is unavailable.
    }
  }, [theme]);

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`Cambiar a modo ${nextTheme === "dark" ? "oscuro" : "claro"}`}
      aria-pressed={isDark}
      onClick={() => setTheme(nextTheme)}
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
      Modo {isDark ? "oscuro" : "claro"}
    </button>
  );
}

export default ThemeToggle;
