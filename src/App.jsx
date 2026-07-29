import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { FiBookOpen, FiRefreshCw, FiShield, FiZap } from 'react-icons/fi';
import Background from './components/Background';
import Flashcards from './components/Flashcards';
import { EmptyStudyState, ErrorState } from './components/EmptyStates';
import { DashboardSkeleton, HeroSkeleton } from './components/Skeletons';
import ProgressCard from './components/ProgressCard';
import Quiz from './components/Quiz';
import StatsGrid from './components/StatsGrid';
import StudyForm from './components/StudyForm';
import ThemeToggle from './components/ThemeToggle';
import { getCompletionScore, normalizeStudyData } from './lib/study';

const SAMPLE_NOTES =
  'The water cycle includes evaporation, condensation, precipitation, and collection. Solar energy drives the cycle. Evaporation turns liquid water into vapour, condensation forms clouds, and precipitation returns water to Earth.';

const initialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem('study-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export default function App() {
  const [theme, setTheme] = useState(initialTheme);
  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [study, setStudy] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestStatus, setRequestStatus] = useState('idle');
  const requestRef = useRef(0);
  const abortRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('study-theme', theme);
  }, [theme]);

  const typedStats = useMemo(() => {
    if (!study) {
      return {
        summaryWords: 0,
        keyPoints: 0,
        flashcards: 0,
        quiz: 0,
        favourites: 0,
        difficult: 0
      };
    }

    return {
      summaryWords: study.summary.split(/\s+/).filter(Boolean).length,
      keyPoints: study.keyPoints.length,
      flashcards: flashcards.length,
      quiz: study.quiz.length,
      favourites: flashcards.filter((card) => card.favourite).length,
      difficult: flashcards.filter((card) => card.difficult).length
    };
  }, [study, flashcards]);

  const progress = useMemo(() => {
    if (!study) return 0;
    return getCompletionScore(
      {
        flashcards,
        quiz: study.quiz
      },
      {
        reviewedCount: flashcards.filter((card) => card.favourite || card.difficult).length
      },
      {
        answeredCount: Object.keys(quizSubmitted).length
      }
    );
  }, [study, flashcards, quizSubmitted]);

  const handleGenerate = async () => {
    if (!notes.trim()) return;

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError('');
    setRequestStatus('loading');

    try {
      const { data } = await axios.post(
        '/api/study/generate',
        { notes },
        { signal: controller.signal, timeout: 120000 }
      );

      if (requestRef.current !== requestId) return;

      const normalized = normalizeStudyData(data.payload ?? data.study ?? data);
      setStudy(normalized);
      setFlashcards(
        normalized.flashcards.map((card) => ({
          ...card,
          favourite: false,
          difficult: false
        }))
      );
      setQuizAnswers({});
      setQuizSubmitted({});
      setRequestStatus('success');
    } catch (err) {
      if (controller.signal.aborted || requestRef.current !== requestId) return;

      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Something went wrong while generating the study kit.';
      setError(message);
      setRequestStatus('error');
      setStudy(null);
      setFlashcards([]);
      setQuizAnswers({});
      setQuizSubmitted({});
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false);
      }
    }
  };

  const handleUseExample = (value) => setNotes(value);

  const clearSession = () => {
    setStudy(null);
    setFlashcards([]);
    setQuizAnswers({});
    setQuizSubmitted({});
    setError('');
    setRequestStatus('idle');
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent text-slate-100">
      <Background />
      <main className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 xl:px-10 xl:py-8 2xl:px-12">
        <header className="glass flex items-center justify-between rounded-[28px] border border-white/10 px-4 py-3 shadow-glow sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-400 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20">
              <FiBookOpen className="text-xl" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Study Assistant</p>
              <p className="text-xs text-slate-300">AI notes to flashcards, quiz, and progress</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 md:flex">
              <FiShield className="text-emerald-300" />
              Backend-only API key
            </div>
            <ThemeToggle theme={theme} onToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow sm:p-8 xl:min-h-[420px] xl:p-10"
          >
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <FiZap />
                Premium study workflow
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Turn messy notes into an interactive study dashboard.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Paste free-form notes or a topic, generate structured JSON from Gemini, and
                review the result through sleek study cards, a self-check quiz, and progress
                tracking. No chatbot, no raw AI text.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 xl:mt-10">
              {[
                ['Structured JSON', 'Validated on the backend before rendering'],
                ['Interactive cards', 'Flip, shuffle, quiz, and revisit'],
                ['Failure-safe', 'Handles malformed, slow, or stale responses']
              ].map(([title, detail]) => (
                <div key={title} className="rounded-[24px] border border-white/10 bg-slate-950/40 p-4 xl:p-5">
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-6">
            {loading ? (
              <HeroSkeleton />
            ) : (
              <div className="space-y-4">
                <StudyForm
                  notes={notes}
                  setNotes={setNotes}
                  onGenerate={handleGenerate}
                  generating={loading}
                  charCount={notes.length}
                  onUseExample={handleUseExample}
                />
                {error ? (
                  <ErrorState
                    title="Generation failed"
                    detail={error}
                    onRetry={handleGenerate}
                  />
                ) : null}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6">
          <AnimatePresence mode="wait">
            {!study && requestStatus !== 'loading' ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EmptyStudyState onUseExample={() => handleUseExample(SAMPLE_NOTES)} />
              </motion.div>
            ) : null}

            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <DashboardSkeleton />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {study ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.6fr)] xl:items-start 2xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.62fr)]">
              <div className="space-y-6">
                <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow sm:p-7 xl:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Study Summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">The big picture, distilled</h2>
                  <p className="mt-4 max-w-4xl text-base leading-8 text-slate-200">{study.summary}</p>
                </section>

                <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow sm:p-7 xl:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Key Points</p>
                  <div className="mt-5 grid gap-3">
                    {study.keyPoints.map((point, index) => (
                      <div key={`${point}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-sm leading-6 text-slate-100">
                          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-200">
                            {index + 1}
                          </span>
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <Flashcards
                  cards={flashcards}
                  onChange={setFlashcards}
                />

                <Quiz
                  questions={study.quiz}
                  answers={quizAnswers}
                  submitted={quizSubmitted}
                  onAnswer={(index, option) => {
                    setQuizAnswers((current) => ({ ...current, [index]: option }));
                  }}
                  onSubmit={(index) => {
                    setQuizSubmitted((current) => ({ ...current, [index]: true }));
                  }}
                  onRetry={(index) => {
                    setQuizAnswers((current) => {
                      const next = { ...current };
                      delete next[index];
                      return next;
                    });
                    setQuizSubmitted((current) => {
                      const next = { ...current };
                      delete next[index];
                      return next;
                    });
                  }}
                />
              </div>

              <aside className="space-y-6 xl:sticky xl:top-8">
                <ProgressCard value={progress} />
                <StatsGrid stats={typedStats} compact />
                <div className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300 shadow-glow">
                  <div className="flex items-center gap-2">
                    <FiRefreshCw className="text-cyan-300" />
                    Want a new deck? Replace the notes and generate again.
                  </div>
                  <button
                    type="button"
                    onClick={clearSession}
                    className="mt-4 w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200 transition hover:bg-white/10"
                  >
                    Clear session
                  </button>
                </div>
              </aside>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
