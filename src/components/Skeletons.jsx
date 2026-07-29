export function HeroSkeleton() {
  return (
    <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow">
      <div className="h-6 w-40 rounded-full bg-white/10" />
      <div className="h-14 w-4/5 rounded-2xl bg-white/10" />
      <div className="h-4 w-full rounded-full bg-white/10" />
      <div className="h-4 w-3/4 rounded-full bg-white/10" />
      <div className="mt-6 h-36 rounded-3xl bg-gradient-to-r from-white/5 via-white/15 to-white/5 bg-[length:200%_100%] animate-shimmer" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="h-64 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow" />
      <div className="h-64 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow" />
      <div className="h-72 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow lg:col-span-2" />
    </div>
  );
}
