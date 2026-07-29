import { motion } from 'framer-motion';

export default function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="grid-noise absolute inset-0 opacity-35" />
      <motion.div
        aria-hidden="true"
        className="absolute left-[-6rem] top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl"
        animate={{ y: [0, -18, 0], x: [0, 12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute right-[-4rem] top-32 h-80 w-80 rounded-full bg-emerald-400/14 blur-3xl"
        animate={{ y: [0, 14, 0], x: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
