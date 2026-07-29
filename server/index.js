require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { z } = require('zod');

const app = express();
const PORT = process.env.PORT || 3001;
const USE_MOCK_AI = String(process.env.USE_MOCK_AI || '').toLowerCase() === 'true';
const FLASHCARD_COUNT = 7;
const QUIZ_COUNT = 8;
const MODEL_ATTEMPTS = 1;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const MODEL_CANDIDATES = Array.from(
  new Set([
    process.env.GEMINI_MODEL,
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash'
  ].filter(Boolean))
);

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const StudyPayloadSchema = z.object({
  summary: z
    .string()
    .min(1)
    .refine((value) => countWords(value) >= 10, {
      message: 'Summary must be at least 10 words long.'
    }),
  keyPoints: z.array(z.string().min(1)).min(10),
  flashcards: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1)
      })
    )
    .length(FLASHCARD_COUNT),
  quiz: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string().min(1)).length(4),
        correctAnswer: z.string().min(1),
        explanation: z.string().min(1)
      })
    )
    .length(QUIZ_COUNT)
    .refine(
      (items) => items.every((item) => item.options.includes(item.correctAnswer)),
      {
        message: 'Each quiz item must include the correct answer in its options.'
      }
    )
});

app.use(
  cors({
    origin: true
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_, res) => {
  res.json({ ok: true, service: 'study-assistant-api' });
});

app.post('/api/study/generate', async (req, res) => {
  const notes = String(req.body?.notes || '').trim();

  if (!notes) {
    return res.status(400).json({ error: 'Please paste notes or a topic before generating.' });
  }

  try {
    let payload;
    let provider;

    if (USE_MOCK_AI || !process.env.GEMINI_API_KEY) {
      payload = buildMockPayload(notes);
      provider = 'mock';
    } else {
      const result = await generateWithGemini(notes);
      payload = result.payload;
      provider = result.provider;
    }

    const parsed = StudyPayloadSchema.parse(coerceStudyPayload(payload, notes));
    return res.json({ payload: parsed, provider });
  } catch (error) {
    const message =
      error?.issues?.[0]?.message ||
      error?.message ||
      'The AI response could not be validated. Please try again.';

    return res.status(422).json({ error: message });
  }
});

function startServer(port = PORT) {
  return app.listen(port, () => {
    console.log(`Study Assistant API running on http://localhost:${port}`);
  });
}

async function generateWithGemini(notes) {
  const prompt = buildPrompt(notes);
  const fallbackPayload = buildMockPayload(notes);
  let lastError = null;

  for (const model of MODEL_CANDIDATES) {
    for (let attempt = 1; attempt <= MODEL_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: [
                    'You are a study material generator.',
                    'Return only valid JSON.',
                    'Do not use markdown.',
                    'Do not wrap the JSON in code fences.',
                    'Do not add extra commentary.'
                  ].join(' ')
                }
              ]
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              maxOutputTokens: 2048,
              responseMimeType: 'application/json'
            }
          })
        });

        if (!response.ok) {
          const text = await response.text();
          const error = new Error(`Gemini request failed for ${model}: ${response.status} ${text}`);
          error.status = response.status;
          error.model = model;
          throw error;
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
        const jsonText = extractJson(rawText || JSON.stringify(data));

        if (!jsonText) {
          throw new Error(`Gemini returned an empty or non-JSON response from ${model}.`);
        }

        return {
          payload: JSON.parse(jsonText),
          provider: 'gemini'
        };
      } catch (error) {
        lastError = error;
        const status = error?.status;
        const isRetryable = !status || RETRYABLE_STATUS_CODES.has(status);

        if (!isRetryable) {
          throw error;
        }

        if (attempt < MODEL_ATTEMPTS) {
          await delay(250 * attempt);
          continue;
        }

        continue;
      }
    }
  }

  if (lastError?.status && RETRYABLE_STATUS_CODES.has(lastError.status)) {
    return {
      payload: fallbackPayload,
      provider: 'mock-fallback'
    };
  }

  throw lastError || new Error('Gemini request failed.');
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPrompt(notes) {
  return [
    'Create a study kit from the following notes.',
    'The output must be a single JSON object with this exact shape:',
    JSON.stringify(
      {
        summary: 'string',
        keyPoints: ['string'],
        flashcards: [{ question: 'string', answer: 'string' }],
        quiz: [
          {
            question: 'string',
            options: ['string', 'string', 'string', 'string'],
            correctAnswer: 'string',
            explanation: 'string'
          }
        ]
      },
      null,
      2
    ),
    'Rules:',
    '- Return JSON only.',
    '- Never use markdown.',
    '- Never add code fences.',
    '- Never add explanatory prose.',
    '- summary must be at least 10 words long and cover the main idea clearly.',
    '- keyPoints must contain exactly 10 concise but useful items.',
    `- flashcards must contain exactly ${FLASHCARD_COUNT} items and should test recall, not definitions copied verbatim.`,
    `- quiz must contain exactly ${QUIZ_COUNT} items.`,
    '- quiz options must be plausible and exactly four items.',
    '- correctAnswer must exactly match one of the four options.',
    '- explanation should be one short sentence.',
    'Notes:',
    notes
  ].join('\n');
}

function extractJson(text) {
  if (!text) return '';

  const start = text.search(/[\[{]/);
  if (start === -1) return '';

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      depth += 1;
    } else if (char === '}' || char === ']') {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return '';
}

function buildMockPayload(notes) {
  const base = notes.split(/[.\n]/).map((part) => part.trim()).filter(Boolean);
  const summary =
    base[0] ||
    'This topic can be turned into a strong active-recall study set for revision.';
  const first = base[0] || notes.slice(0, 80);
  const second = base[1] || 'Focus on the core ideas, then review with self-testing.';
  const third = base[2] || 'Use repetition and quick recall to strengthen memory.';
  const fourth = base[3] || 'Connect each idea to a real example to improve retention.';
  const fifth = base[4] || 'Look for cause and effect relationships across the material.';
  const sixth = base[5] || 'Group related concepts together before reviewing them.';
  const seventh = base[6] || 'Identify terms, definitions, and supporting details separately.';
  const eighth = base[7] || 'Revisit the hardest sections after short breaks.';
  const ninth = base[8] || 'Explain the content out loud to check understanding.';
  const tenth = base[9] || 'Finish by testing recall without looking at the notes.';

  return {
    summary,
    keyPoints: [first, second, third, fourth, fifth, sixth, seventh, eighth, ninth, tenth].slice(0, 10),
    flashcards: [
      {
        question: 'What is the main idea?',
        answer: summary
      },
      {
        question: 'Which detail should you remember first?',
        answer: first
      },
      {
        question: 'What is a useful study strategy here?',
        answer: 'Test yourself using recall instead of rereading.'
      },
      {
        question: 'What is one supporting point?',
        answer: second
      },
      {
        question: 'How should the learner review this?',
        answer: third
      },
      {
        question: 'What is a good way to check understanding?',
        answer: 'Explain the idea in your own words.'
      },
      {
        question: 'What should happen after a break?',
        answer: 'Return and self-test the material again.'
      }
    ],
    quiz: Array.from({ length: QUIZ_COUNT }, (_, index) => {
      const answer =
        index % 2 === 0 ? 'Build active recall questions' : 'Repeatedly with self-testing';
      return {
        question:
          index === 0
            ? 'What is the best next step after reading these notes?'
            : `Which approach best supports question ${index + 1}?`,
        options: [
          answer,
          'Ignore the notes',
          'Delete the notes',
          'Only highlight random words'
        ],
        correctAnswer: answer,
        explanation:
          index % 2 === 0
            ? 'Active recall helps move the material into long-term memory.'
            : 'Repeated retrieval practice improves retention.'
      };
    })
  };
}

function coerceStudyPayload(payload, notes) {
  const fallback = buildMockPayload(notes);
  const source = payload && typeof payload === 'object' ? payload : {};

  const keyPoints = Array.isArray(source.keyPoints) ? source.keyPoints.slice(0, 10) : [];
  const flashcards = Array.isArray(source.flashcards) ? source.flashcards.slice(0, FLASHCARD_COUNT) : [];
  const quiz = Array.isArray(source.quiz) ? source.quiz.slice(0, QUIZ_COUNT) : [];

  while (keyPoints.length < 10) {
    const index = keyPoints.length;
    keyPoints.push(fallback.keyPoints[index] || fallback.keyPoints[index % fallback.keyPoints.length]);
  }

  while (quiz.length < QUIZ_COUNT) {
    const index = quiz.length;
    quiz.push(fallback.quiz[index] || fallback.quiz[index % fallback.quiz.length]);
  }

  while (flashcards.length < FLASHCARD_COUNT) {
    const index = flashcards.length;
    flashcards.push(fallback.flashcards[index] || fallback.flashcards[index % fallback.flashcards.length]);
  }

  return {
    summary:
      typeof source.summary === 'string' && source.summary.trim() && countWords(source.summary) >= 10
        ? source.summary.trim()
        : fallback.summary,
    keyPoints: keyPoints.map((item) => String(item).trim()).filter(Boolean),
    flashcards: flashcards.map((item, index) => ({
      question:
        typeof item?.question === 'string' && item.question.trim()
          ? item.question.trim()
          : fallback.flashcards[index].question,
      answer:
        typeof item?.answer === 'string' && item.answer.trim()
          ? item.answer.trim()
          : fallback.flashcards[index].answer
    })),
    quiz: quiz.map((item, index) => {
      const fallbackQuiz = fallback.quiz[index];
      const options = Array.isArray(item?.options)
        ? item.options.map((option) => String(option).trim()).filter(Boolean).slice(0, 4)
        : [];

      while (options.length < 4) {
        options.push(fallbackQuiz.options[options.length]);
      }

      const correctAnswer =
        typeof item?.correctAnswer === 'string' && item.correctAnswer.trim()
          ? item.correctAnswer.trim()
          : fallbackQuiz.correctAnswer;

      return {
        question:
          typeof item?.question === 'string' && item.question.trim()
            ? item.question.trim()
            : fallbackQuiz.question,
        options,
        correctAnswer: options.includes(correctAnswer) ? correctAnswer : options[0],
        explanation:
          typeof item?.explanation === 'string' && item.explanation.trim()
            ? item.explanation.trim()
            : fallbackQuiz.explanation
      };
    })
  };
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
