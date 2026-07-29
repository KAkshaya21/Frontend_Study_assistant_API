import { FiBarChart2, FiBookOpen, FiCheckCircle, FiLayers, FiTarget, FiTrendingUp } from 'react-icons/fi';

const statIcons = [FiBarChart2, FiBookOpen, FiLayers, FiTarget, FiCheckCircle, FiTrendingUp];

export default function StatsGrid({ stats, compact = false }) {
  const items = [
    { label: 'Summary depth', value: `${stats.summaryWords} words`, tone: 'from-cyan-400/20 to-cyan-400/5' },
    { label: 'Key points', value: stats.keyPoints, tone: 'from-sky-400/20 to-sky-400/5' },
    { label: 'Flashcards', value: stats.flashcards, tone: 'from-emerald-400/20 to-emerald-400/5' },
    { label: 'Quiz questions', value: stats.quiz, tone: 'from-amber-400/20 to-amber-400/5' },
    { label: 'Favorites', value: stats.favourites, tone: 'from-violet-400/20 to-violet-400/5' },
    { label: 'Difficulty marks', value: stats.difficult, tone: 'from-rose-400/20 to-rose-400/5' }
  ];

  return (
    <section className={`grid gap-4 ${compact ? 'sm:grid-cols-2 xl:grid-cols-1' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
      {items.map((item, index) => {
        const Icon = statIcons[index];
        return (
          <div
            key={item.label}
            className={`rounded-[26px] border border-white/10 bg-gradient-to-br ${item.tone} p-5 shadow-soft`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-300">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Icon />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
