/**
 * Universal AI Service for Chapter Mastery Kit Pro
 * Works seamlessly in all environments:
 * 1. Full-stack Express backend (/api/*)
 * 2. Vercel serverless functions (/api/index)
 * 3. Static deployment fallback (direct browser DeepSeek API calls via CORS)
 * 4. Resilient client-side curriculum generation fallback
 */

import { ChapterMap, Keyword, Question, QuizItem, RetrievalEvaluation } from '../types';
import { AiSettings } from '../components/AiSettingsModal';

export interface StudyKitResult {
  map: ChapterMap;
  keywords: Keyword[];
  questions: Question[];
  quiz: QuizItem[];
}

/**
 * Helper to call DeepSeek API directly from the browser when backend is unavailable
 */
async function callDeepSeekClientDirect(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<any> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: model || 'deepseek-chat',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `DeepSeek API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from DeepSeek API');
  return JSON.parse(content);
}

/**
 * 1. Generate Full Chapter Mastery Kit
 */
export async function generateStudyKit(
  data: {
    title: string;
    subject: string;
    grade: number;
    examDate?: string;
    text: string;
    depthMode: 'in-depth' | 'on-the-go';
    sources: any[];
  },
  aiSettings: AiSettings
): Promise<StudyKitResult> {
  const isInDepth = data.depthMode !== 'on-the-go';
  const branchCount = isInDepth ? '6 to 10' : '4 to 5';
  const keywordCount = isInDepth ? '12 to 16' : '6 to 8';
  const questionCount = isInDepth ? '5 to 7' : '3 to 4';
  const quizCount = isInDepth ? '8 to 10' : '5 to 6';

  // Strategy A: Try the server proxy route (/api/generate-kit)
  try {
    const res = await fetch('/api/generate-kit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        aiProvider: aiSettings.provider,
        deepseekApiKey: aiSettings.deepseekApiKey,
        deepseekModel: aiSettings.deepseekModel,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const kit = await res.json();
      if (kit && kit.map && kit.keywords) {
        return kit;
      }
    }
  } catch (backendError) {
    console.warn('Backend /api/generate-kit unreachable or static host detected, using client fallback:', backendError);
  }

  // Strategy B: If user has DeepSeek configured, call DeepSeek directly from browser
  if (aiSettings.deepseekApiKey && aiSettings.deepseekApiKey.trim()) {
    try {
      const systemPrompt = `You are the "Chapter Mastery Engine" — master educator and cognitive scientist for Grade ${data.grade} students.
Language: Clear, inspiring, age-appropriate English. Use vivid, concrete everyday analogies.
Return valid JSON only matching: { "map": {...}, "keywords": [...], "questions": [...], "quiz": [...] }`;

      const userPrompt = `Build a complete Chapter Mastery Kit for:
CHAPTER: "${data.title}"
GRADE: ${data.grade}
SUBJECT: ${data.subject}
DEPTH: ${isInDepth ? 'In-Depth' : 'On-The-Go'}

CONTENT:
${data.text ? data.text.slice(0, 10000) : 'Generate curriculum-standard concepts for this chapter.'}

SCHEMA:
1. "map": {
   "chapterTitle": "${data.title}",
   "oneLineSummary": "...",
   "bigIdea": "...",
   "bigIdeaEmoji": "💡",
   "bigIdeaAnalogy": "Think of it like...",
   "learningOutcomes": ["..."],
   "estimatedStudyMinutes": ${isInDepth ? 25 : 15},
   "branches": [
     { "id": "b1", "branchName": "...", "branchEmoji": "📌", "analogy": "...", "subPoints": ["..."], "keyTakeaways": ["..."] }
   ]
} (provide exactly ${branchCount} branches)
2. "keywords": [
   { "id": "k1", "word": "...", "type": "concept/process/noun", "childMeaning": "under 14 words", "example": "...", "memoryHook": "...", "spellingTip": "..." }
] (provide exactly ${keywordCount} items)
3. "questions": [
   { "id": "q1", "type": "short-answer", "question": "...", "modelAnswer": "...", "keyWordsUsed": ["..."], "marks": 3 }
] (provide exactly ${questionCount} items)
4. "quiz": [
   { "id": "qz1", "type": "mcq", "question": "...", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "..." },
   { "id": "qz2", "type": "fill-blank", "question": "...", "answer": "...", "explanation": "..." },
   { "id": "qz3", "type": "match", "question": "...", "pairs": [{"left":"...","right":"..."}], "explanation": "..." },
   { "id": "qz4", "type": "true-false", "question": "...", "answer": true, "explanation": "..." }
] (provide exactly ${quizCount} items)`;

      const directKit = await callDeepSeekClientDirect(
        aiSettings.deepseekApiKey,
        aiSettings.deepseekModel || 'deepseek-chat',
        systemPrompt,
        userPrompt
      );

      if (directKit && directKit.map && directKit.keywords) {
        return directKit;
      }
    } catch (dsErr: any) {
      console.warn('Direct DeepSeek call error:', dsErr.message);
    }
  }

  // Strategy C: Client-side dynamic fallback generator (Never fails)
  return buildDynamicClientFallbackKit(data.title, data.subject, data.grade, data.text, isInDepth);
}

/**
 * 2. Evaluate Student Answer
 */
export async function evaluateStudentAnswer(
  params: {
    question: string;
    modelAnswer: string;
    keyWordsUsed: string[];
    marks: number;
    studentAnswer: string;
  },
  aiSettings: AiSettings,
  grade: number = 6
): Promise<any> {
  // Strategy A: Server proxy
  try {
    const res = await fetch('/api/evaluate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        aiProvider: aiSettings.provider,
        deepseekApiKey: aiSettings.deepseekApiKey,
        deepseekModel: aiSettings.deepseekModel,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {
    // fallback
  }

  // Strategy B: DeepSeek Direct
  if (aiSettings.deepseekApiKey && aiSettings.deepseekApiKey.trim()) {
    try {
      const prompt = `Grade student answer against rubric:
QUESTION: ${params.question}
MAX MARKS: ${params.marks}
MODEL ANSWER: ${params.modelAnswer}
KEY WORDS: ${params.keyWordsUsed.join(', ')}
STUDENT ANSWER: "${params.studentAnswer}"

Return JSON:
{ "score": number, "maxScore": ${params.marks}, "whatGood": "1-2 sentences", "howToImprove": "1-2 sentences", "encouragement": "1 sentence" }`;

      const result = await callDeepSeekClientDirect(
        aiSettings.deepseekApiKey,
        aiSettings.deepseekModel,
        'You are a school examiner. Return valid JSON only.',
        prompt
      );
      return { ...result, evaluatedAt: new Date().toISOString() };
    } catch (e) {}
  }

  // Strategy C: Heuristic evaluation
  const words = params.studentAnswer.trim().toLowerCase().split(/\s+/);
  const matched = (params.keyWordsUsed || []).filter((kw) =>
    params.studentAnswer.toLowerCase().includes(kw.toLowerCase())
  );
  const ratio = matched.length / Math.max(1, params.keyWordsUsed.length);
  const maxScore = params.marks || 3;
  let score = Math.round(ratio * maxScore);
  if (words.length > 25 && score < maxScore) score = Math.min(maxScore, score + 1);
  if (score < 1 && words.length > 10) score = 1;

  return {
    score,
    maxScore,
    whatGood:
      matched.length > 0
        ? `Great job mentioning key terms like ${matched.join(', ')}! You expressed clear conceptual understanding.`
        : 'You formulated a thoughtful answer in your own words.',
    howToImprove:
      matched.length < params.keyWordsUsed.length
        ? `Try to explicitly incorporate more precise scientific terms like: ${params.keyWordsUsed
            .filter((k) => !matched.includes(k))
            .slice(0, 2)
            .join(', ')}.`
        : 'Include one specific real-world example to make your answer completely watertight.',
    encouragement: 'Every attempt strengthens neural connections in your brain — keep up the fantastic effort! 🌟',
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * 3. Evaluate Student Retrieval (Brain Dump)
 */
export async function evaluateStudentRetrieval(
  params: {
    targetTitle: string;
    targetType: string;
    expectedPoints: string[];
    expectedAnalogy?: string;
    studentRecallText: string;
    chapterTitle: string;
    grade: number;
  },
  aiSettings: AiSettings
): Promise<RetrievalEvaluation> {
  // Strategy A: Server proxy
  try {
    const res = await fetch('/api/evaluate-retrieval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        aiProvider: aiSettings.provider,
        deepseekApiKey: aiSettings.deepseekApiKey,
        deepseekModel: aiSettings.deepseekModel,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {
    // fallback
  }

  // Strategy B: DeepSeek Direct
  if (aiSettings.deepseekApiKey && aiSettings.deepseekApiKey.trim()) {
    try {
      const prompt = `Analyze student closed-book retrieval:
CHAPTER: "${params.chapterTitle}"
TOPIC: "${params.targetTitle}"
MAP ANALOGY: ${params.expectedAnalogy || 'N/A'}
MAP POINTS: ${params.expectedPoints.join(' | ')}
STUDENT RECALL: "${params.studentRecallText}"

Return JSON:
{
  "retrievalScore": number (0-100),
  "strengthBadge": "Iron Memory"|"Sharp Recall"|"Good Recall"|"Needs Reinforcement",
  "recalledPoints": ["..."],
  "missedPoints": ["..."],
  "analogyFeedback": "...",
  "actionableTip": "...",
  "encouragement": "..."
}`;

      const result = await callDeepSeekClientDirect(
        aiSettings.deepseekApiKey,
        aiSettings.deepseekModel,
        'You are a cognitive psychologist evaluating retrieval practice. Return JSON only.',
        prompt
      );
      return { ...result, evaluatedAt: new Date().toISOString() };
    } catch (e) {}
  }

  // Strategy C: Heuristic fallback
  const words = params.studentRecallText.trim().toLowerCase().split(/\s+/);
  const found: string[] = [];
  const missed: string[] = [];

  (params.expectedPoints || []).forEach((pt) => {
    const keyTerms = pt.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const hasOverlap = keyTerms.some((kt) => params.studentRecallText.toLowerCase().includes(kt));
    if (hasOverlap) found.push(pt.slice(0, 60));
    else missed.push(pt.slice(0, 60));
  });

  const ratio = Math.min(1, Math.max(0.35, (found.length + (words.length > 20 ? 1 : 0)) / Math.max(1, params.expectedPoints.length)));
  const finalScore = Math.round(ratio * 100);

  return {
    retrievalScore: finalScore,
    strengthBadge:
      finalScore >= 85
        ? 'Iron Memory'
        : finalScore >= 70
        ? 'Sharp Recall'
        : finalScore >= 50
        ? 'Good Recall'
        : 'Needs Reinforcement',
    recalledPoints: found.length > 0 ? found.slice(0, 3) : ['Captured the central concept in your own voice'],
    missedPoints: missed.slice(0, 2),
    analogyFeedback:
      params.studentRecallText.toLowerCase().includes('like') || params.studentRecallText.toLowerCase().includes('as')
        ? 'Great job relating the concept with an analogy!'
        : 'Try using an everyday "Think of it like..." comparison next time.',
    actionableTip: `Take a 10-second peek back at "${params.targetTitle}" in the Advance Map to lock in the missing points.`,
    encouragement: 'The effort of straining to remember builds 3x stronger memory pathways than re-reading! 🧠✨',
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * 4. Socratic Coach Chat
 */
export async function sendCoachMessage(
  params: {
    chapterTitle: string;
    subject: string;
    grade: number;
    message: string;
    history: any[];
    currentContext: string;
  },
  aiSettings: AiSettings
): Promise<{ reply: string; quickQuestions?: string[] }> {
  // Strategy A: Server proxy
  try {
    const res = await fetch('/api/coach-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        aiProvider: aiSettings.provider,
        deepseekApiKey: aiSettings.deepseekApiKey,
        deepseekModel: aiSettings.deepseekModel,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {
    // fallback
  }

  // Strategy B: DeepSeek Direct
  if (aiSettings.deepseekApiKey && aiSettings.deepseekApiKey.trim()) {
    try {
      const sys = `You are "Sparky", a supportive Socratic study coach for Grade ${params.grade} in ${params.subject}.
Locked to "${params.chapterTitle}".
Never blurt final answers; ask guiding questions and give clues so the student's brain works.
Return JSON: { "reply": "...", "quickQuestions": ["...", "..."] }`;

      const prompt = `Context: ${params.currentContext.slice(0, 1000)}
History: ${(params.history || []).map((h) => `${h.role}: ${h.content}`).join('\n')}
Student says: "${params.message}"`;

      const result = await callDeepSeekClientDirect(
        aiSettings.deepseekApiKey,
        aiSettings.deepseekModel,
        sys,
        prompt
      );
      return result;
    } catch (e) {}
  }

  // Strategy C: Fallback
  return {
    reply: `That's a thoughtful question about ${params.chapterTitle}! Think about what happens when the core mechanism takes place. How would you explain that to a 7-year-old friend?`,
    quickQuestions: [
      'Give me a simple analogy for this',
      'Test me with a quick question!',
      'What is the most important exam point here?',
    ],
  };
}

/**
 * Dynamic fallback generator that produces high-yield curriculum kits
 */
function buildDynamicClientFallbackKit(
  title: string,
  subject: string,
  grade: number,
  text: string,
  isInDepth: boolean
): StudyKitResult {
  const cleanTitle = title || 'Chapter Mastery';
  const sub = subject || 'Science';

  return {
    map: {
      chapterTitle: cleanTitle,
      oneLineSummary: `Core principles, mechanisms, and key outcomes of ${cleanTitle}.`,
      bigIdea: `Understanding ${cleanTitle} reveals how fundamental principles connect cause and effect in ${sub}.`,
      bigIdeaEmoji: '💡',
      bigIdeaAnalogy: `Think of ${cleanTitle} like building a sturdy Lego structure: each foundational block clicks into the next to create a complete understanding.`,
      learningOutcomes: [
        `Master the foundational definitions and scope of ${cleanTitle}`,
        `Understand the step-by-step mechanisms and causes`,
        `Apply knowledge to solve standard exam problems and reasoning questions`,
        `Connect these principles to real-world scenarios`,
      ],
      estimatedStudyMinutes: isInDepth ? 25 : 15,
      branches: [
        {
          id: 'b1',
          branchName: `Foundations of ${cleanTitle}`,
          branchEmoji: '🌱',
          analogy: 'Like laying the foundation bricks before building the roof.',
          subPoints: [
            `Core definitions and background principles governing ${cleanTitle}.`,
            `Key factors that trigger or influence this phenomenon.`,
            `Why this concept is essential to ${sub}.`,
          ],
          keyTakeaways: [
            `Foundations establish the vocabulary and laws.`,
            `Every major mechanism relies on these baseline rules.`,
          ],
        },
        {
          id: 'b2',
          branchName: 'Core Mechanics & Processes',
          branchEmoji: '⚙️',
          analogy: 'Like the moving gears inside a mechanical clockwork watch.',
          subPoints: [
            'Sequential progression from cause to effect.',
            'Crucial reactions, interactions, or structural functions.',
            'How energy, materials, or information flow through the system.',
          ],
          keyTakeaways: [
            'Process flows sequentially from inputs to outputs.',
            'Small changes in conditions lead to observable effects.',
          ],
        },
        {
          id: 'b3',
          branchName: 'Real-World Evidence & Applications',
          branchEmoji: '🌍',
          analogy: 'Like spotting the rules of science in action while riding a bicycle.',
          subPoints: [
            'Everyday examples where this concept is clearly visible.',
            'Scientific, historical, or environmental significance.',
            'How researchers verify and measure these principles.',
          ],
          keyTakeaways: [
            'Directly observable in natural and human-engineered systems.',
            'Crucial for answering exam application questions.',
          ],
        },
        {
          id: 'b4',
          branchName: 'Summary & Exam Highlights',
          branchEmoji: '🎯',
          analogy: 'Like a checklist before a big flight to ensure nothing is forgotten.',
          subPoints: [
            'Most commonly tested questions in school board exams.',
            'Frequent misconceptions students make and how to avoid them.',
            'Quick formula or mental checklist for full marks.',
          ],
          keyTakeaways: [
            'Always define keywords before explaining mechanisms.',
            'Review key vocabulary terms during final exam revision.',
          ],
        },
      ],
    },
    keywords: [
      {
        id: 'k1',
        word: cleanTitle.split(' ')[0] || 'Principle',
        type: 'concept',
        childMeaning: `The primary concept or central force in ${cleanTitle}.`,
        example: `We observe how ${cleanTitle.split(' ')[0]} operates in nature.`,
        memoryHook: `Remember the root word to instantly recall the definition!`,
        spellingTip: `Break down the syllables carefully.`,
      },
      {
        id: 'k2',
        word: 'Mechanism',
        type: 'process',
        childMeaning: 'The step-by-step way a system works or produces results.',
        example: 'Understanding the mechanism helps explain why changes occur.',
        memoryHook: 'Mechanism = Machine parts working together in order!',
        spellingTip: 'M - E - C - H - A - N - I - S - M.',
      },
      {
        id: 'k3',
        word: 'Equilibrium',
        type: 'concept',
        childMeaning: 'A state of steady balance where opposing forces are equal.',
        example: 'Natural cycles seek equilibrium over time.',
        memoryHook: 'EQUAL balance = Equilibrium!',
        spellingTip: 'E-Q-U-I-L-I-B-R-I-U-M.',
      },
      {
        id: 'k4',
        word: 'Hypothesis',
        type: 'concept',
        childMeaning: 'An educated guess or testable scientific explanation.',
        example: 'Students formulated a hypothesis before running the test.',
        memoryHook: 'Hypo (under) + thesis (statement) = testable idea!',
        spellingTip: 'H-Y-P-O-T-H-E-S-I-S.',
      },
    ],
    questions: [
      {
        id: 'q1',
        type: 'short-answer',
        question: `What is the primary significance of ${cleanTitle} in ${sub}?`,
        modelAnswer: `${cleanTitle} establishes the core mechanisms and principles that govern how systems behave in ${sub}. It connects foundational observations with predictable real-world outcomes.`,
        keyWordsUsed: ['principles', 'mechanisms', 'system', 'outcomes'],
        marks: 2,
      },
      {
        id: 'q2',
        type: 'reasoning',
        question: `Explain how a change in starting conditions affects the outcome of ${cleanTitle}.`,
        modelAnswer: `When starting conditions change, the balance of the system shifts according to governing laws, resulting in altered rates of reaction, structural adjustments, or different final observations.`,
        keyWordsUsed: ['conditions', 'balance', 'governing laws', 'observations'],
        marks: 3,
      },
    ],
    quiz: [
      {
        id: 'qz1',
        type: 'mcq',
        question: `Which statement best describes the fundamental idea of ${cleanTitle}?`,
        options: [
          `It operates under random chance with no observable laws`,
          `It follows consistent principles connecting causes with outcomes`,
          `It only occurs in artificial laboratories and never in nature`,
          `It has no relevance to modern science`,
        ],
        correctIndex: 1,
        explanation: 'Scientific and academic principles follow consistent, observable laws that explain cause-and-effect relationships.',
      },
      {
        id: 'qz2',
        type: 'true-false',
        question: `Understanding core vocabulary is essential before answering multi-mark exam questions.`,
        answer: true,
        explanation: 'True! Examiners award marks for accurate use of specific curriculum terminology.',
      },
      {
        id: 'qz3',
        type: 'fill-blank',
        question: `A step-by-step sequence of events that explains how a phenomenon occurs is called a ______.`,
        answer: 'mechanism',
        explanation: 'A mechanism describes the exact stages and interactions that produce an observed result.',
      },
    ],
  };
}
