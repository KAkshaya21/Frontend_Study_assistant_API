import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiRefreshCcw, FiShuffle, FiStar, FiAlertCircle } from 'react-icons/fi';
import { useEffect, useMemo, useState } from 'react';

function shuffleCards(cards) {
  const next = [...cards];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function Flashcards({ cards = [], deckKey = 0, onChange }) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setDeck(cards);
    setIndex(0);
    setFlipped(false);
  }, [deckKey]);

  const current = deck[index];
  const stats = useMemo(
    () => ({
      favourites: deck.filter((card) => card.favourite).length,
      difficult: deck.filter((card) => card.difficult).length
    }),
    [deck]
  );

  const updateCurrent = (updater) => {
    const nextDeck = deck.map((card, cardIndex) => (cardIndex === index ? updater(card) : card));
    setDeck(nextDeck);
    onChange?.(nextDeck);
  };

  if (!deck.length) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-slate-300 shadow-glow">
        <div className="flex items-center gap-2 text-amber-300">
          <FiAlertCircle />
          No flashcards generated yet.
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Flashcards</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Flip through the deck</h3>
          <p className="mt-1 text-sm text-slate-300">
            Card {index + 1} of {deck.length}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-200">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Favs {stats.favourites}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Hard {stats.difficult}</span>
        </div>
      </div>

      <div style={{ perspective: '1800px' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.button
            key={`${index}-${flipped ? 'back' : 'front'}`}
            type="button"
            onClick={() => setFlipped((value) => !value)}
            initial={{ opacity: 0, rotateX: 12, y: 12 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, rotateX: -12, y: -12 }}
            transition={{ duration: 0.25 }}
            className="relative min-h-[260px] w-full overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-left shadow-2xl outline-none"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_25%)]" />
            <div className="relative flex h-full flex-col justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300/70">
                  {flipped ? 'Answer' : 'Question'}
                </p>
                <p className="mt-4 text-2xl font-semibold leading-snug text-white">
                  {flipped ? current.answer : current.question}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Tap to flip</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {flipped ? 'Answer side' : 'Question side'}
                </span>
              </div>
            </div>
          </motion.button>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIndex((currentIndex) => (currentIndex - 1 + deck.length) % deck.length)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          <FiArrowLeft />
          Previous
        </button>
        <button
          type="button"
          onClick={() => setIndex((currentIndex) => (currentIndex + 1) % deck.length)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          Next
          <FiArrowRight />
        </button>
        <button
          type="button"
          onClick={() => {
            const nextDeck = shuffleCards(deck);
            setDeck(nextDeck);
            onChange?.(nextDeck);
            setIndex(0);
            setFlipped(false);
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          <FiShuffle />
          Shuffle
        </button>
        <button
          type="button"
          onClick={() => {
            const nextDeck = [...cards];
            setDeck(nextDeck);
            onChange?.(nextDeck);
            setIndex(0);
            setFlipped(false);
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          <FiRefreshCcw />
          Restart
        </button>
        <button
          type="button"
          onClick={() => updateCurrent((card) => ({ ...card, favourite: !card.favourite }))}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
            current.favourite
              ? 'border-amber-300/40 bg-amber-400/15 text-amber-100'
              : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
          }`}
        >
          <FiStar />
          Mark Favourite
        </button>
        <button
          type="button"
          onClick={() => updateCurrent((card) => ({ ...card, difficult: !card.difficult }))}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
            current.difficult
              ? 'border-rose-300/40 bg-rose-400/15 text-rose-100'
              : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
          }`}
        >
          <FiAlertCircle />
          Mark Difficult
        </button>
      </div>
    </section>
  );
}
