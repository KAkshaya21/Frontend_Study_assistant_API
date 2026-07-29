export default function ProgressCard({ value }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Progress</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Your study momentum</h3>
          <p className="mt-1 text-sm text-slate-300">Based on how much of the deck and quiz you have engaged with.</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-semibold text-white">{value}%</p>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">completion</p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </section>
  );
}
