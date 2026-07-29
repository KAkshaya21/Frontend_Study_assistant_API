import { motion } from 'framer-motion';
import { FiBook, FiZap } from 'react-icons/fi';
import { exampleNotes } from '../data/examples';

export default function StudyForm({
  notes,
  setNotes,
  onGenerate,
  generating,
  charCount,
  onUseExample
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glass relative overflow-hidden rounded-[32px] border border-white/10 p-6 shadow-glow lg:p-8"
    >
      <div className="absolute inset-0 grid-noise opacity-40" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300/80">Study Assistant</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Transform rough notes into active recall</h2>
        </div>
        <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-xs text-slate-300 sm:block">
          <p className="font-semibold text-white">No chatbot here</p>
          <p>Structured JSON only</p>
        </div>
      </div>

      <div className="relative mt-6 space-y-4">
        <label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <FiBook />
          Paste study notes or a topic
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Try something like: cellular respiration, photosynthesis, or paste your lecture notes here..."
          className="min-h-[240px] w-full resize-y rounded-[28px] border border-white/10 bg-slate-950/40 px-5 py-4 text-base leading-7 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/15 dark:bg-slate-900/50"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{charCount} chars</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {notes.trim().split(/\s+/).filter(Boolean).length || 0} words
            </span>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating || !notes.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiZap />
            {generating ? 'Generating...' : 'Generate Study Kit'}
          </button>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Example notes
          </p>
          <div className="flex flex-wrap gap-2">
            {exampleNotes.map((example) => (
              <button
                type="button"
                key={example.title}
                onClick={() => onUseExample(example.value)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
              >
                {example.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
