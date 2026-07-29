import { FiBookOpen, FiAlertTriangle } from 'react-icons/fi';

export function EmptyStudyState({ onUseExample }) {
  return (
    <div className="rounded-[32px] border border-dashed border-white/15 bg-white/5 p-8 text-center shadow-glow">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
        <FiBookOpen className="text-2xl" />
      </div>
      <h3 className="text-xl font-semibold text-white">Drop in your notes to build a study deck</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">
        The backend will ask Gemini for structured JSON, validate it, and then the frontend
        turns that into flashcards, a quiz, and progress cards.
      </p>
      <button
        type="button"
        onClick={onUseExample}
        className="mt-6 inline-flex items-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
      >
        Load example notes
      </button>
    </div>
  );
}

export function ErrorState({ title, detail, onRetry }) {
  return (
    <div className="rounded-[32px] border border-rose-400/20 bg-rose-500/10 p-8 text-center shadow-glow">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-200">
        <FiAlertTriangle className="text-2xl" />
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-rose-100/90">{detail}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
      >
        Retry
      </button>
    </div>
  );
}
