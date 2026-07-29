export function normalizeStudyData(payload) {
  const summary = typeof payload?.summary === 'string' ? payload.summary.trim() : '';
  const keyPoints = Array.isArray(payload?.keyPoints)
    ? payload.keyPoints.filter(Boolean).map((point) => String(point).trim()).filter(Boolean)
    : [];
  const flashcards = Array.isArray(payload?.flashcards)
    ? payload.flashcards
        .map((card) => ({
          question: String(card?.question ?? '').trim(),
          answer: String(card?.answer ?? '').trim(),
          favourite: false,
          difficult: false
        }))
        .filter((card) => card.question && card.answer)
    : [];
  const quiz = Array.isArray(payload?.quiz)
    ? payload.quiz
        .map((item) => ({
          question: String(item?.question ?? '').trim(),
          options: Array.isArray(item?.options)
            ? item.options.map((option) => String(option).trim()).filter(Boolean).slice(0, 4)
            : [],
          correctAnswer: String(item?.correctAnswer ?? '').trim(),
          explanation: String(item?.explanation ?? '').trim()
        }))
        .filter((item) => item.question && item.correctAnswer && item.options.length === 4)
    : [];

  return {
    summary,
    keyPoints,
    flashcards,
    quiz
  };
}

export function getCompletionScore(study, flashcardState, quizState) {
  const flashcards = study.flashcards?.length ?? 0;
  const quiz = study.quiz?.length ?? 0;
  const reviewed = flashcardState.reviewedCount ?? 0;
  const answered = quizState.answeredCount ?? 0;

  if (!flashcards && !quiz) return 0;

  const flashcardProgress = flashcards ? reviewed / flashcards : 1;
  const quizProgress = quiz ? answered / quiz : 1;
  const weights = [];

  if (flashcards) {
    weights.push({ progress: flashcardProgress, weight: 0.55 });
  }

  if (quiz) {
    weights.push({ progress: quizProgress, weight: 0.45 });
  }

  const weightedScore = weights.reduce((total, item) => total + item.progress * item.weight, 0);
  const totalWeight = weights.reduce((total, item) => total + item.weight, 0) || 1;

  return Math.max(0, Math.min(100, Math.round((weightedScore / totalWeight) * 100)));
}
