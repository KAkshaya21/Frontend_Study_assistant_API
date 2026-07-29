import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { FiCheckCircle, FiHelpCircle, FiXCircle } from 'react-icons/fi';

export default function Quiz({
  questions = [],
  answers = {},
  submitted = {},
  onAnswer,
  onSubmit,
  onRetry
}) {
  const score = useMemo(
    () =>
      questions.reduce((total, question, index) => {
        if (!submitted[index]) return total;
        return total + (answers[index] === question.correctAnswer ? 1 : 0);
      }, 0),
    [answers, questions, submitted]
  );

  if (!questions.length) {
    return (
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow">
        <div className="flex items-center gap-2 text-slate-300">
          <FiHelpCircle />
          No quiz questions generated yet.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Quiz</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Test yourself, then review the explanation</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          Score {score}/{questions.length}
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const selected = answers[index];
          const isSubmitted = submitted[index];
          const correct = selected === question.correctAnswer;

          return (
            <motion.article
              key={`${question.question}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-[28px] border border-white/10 bg-slate-950/45 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Question {index + 1}</p>
                  <h4 className="mt-2 text-lg font-semibold text-white">{question.question}</h4>
                </div>
                {isSubmitted ? (
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      correct
                        ? 'bg-emerald-400/15 text-emerald-200'
                        : 'bg-rose-400/15 text-rose-200'
                    }`}
                  >
                    {correct ? <FiCheckCircle /> : <FiXCircle />}
                    {correct ? 'Correct' : 'Try again'}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => {
                  const active = selected === option;
                  const showCorrect = isSubmitted && option === question.correctAnswer;
                  const showIncorrect = isSubmitted && active && option !== question.correctAnswer;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onAnswer(index, option)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        showCorrect
                          ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-50'
                          : showIncorrect
                          ? 'border-rose-400/40 bg-rose-400/15 text-rose-50'
                          : active
                          ? 'border-cyan-400/40 bg-cyan-400/10 text-white'
                          : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-300">
                  {isSubmitted ? question.explanation : 'Choose an option and submit when ready.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (isSubmitted && !correct) {
                      onRetry(index);
                      return;
                    }

                    onSubmit(index);
                  }}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isSubmitted && !correct
                      ? 'bg-rose-400 text-slate-950 hover:bg-rose-300'
                      : 'bg-white text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  {isSubmitted && !correct ? 'Try again' : 'Check answer'}
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
