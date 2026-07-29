import { FiMoon, FiSun } from 'react-icons/fi';

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 shadow-soft transition hover:-translate-y-0.5 hover:bg-white/10 dark:text-slate-100"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <FiSun className="text-amber-300" /> : <FiMoon className="text-slate-500" />}
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
