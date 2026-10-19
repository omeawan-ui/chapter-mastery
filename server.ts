import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini SDK with telemetry header per guidelines
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ------------------------------------------------------------------
// Unified LLM Caller (supports DeepSeek API & Gemini)
// ------------------------------------------------------------------
interface LLMOptions {
  provider?: 'gemini' | 'deepseek';
  deepseekApiKey?: string;
  deepseekModel?: string;
}

async function executeLLMCall(
  systemInstruction: string,
  userPrompt: string,
  jsonFormat: boolean,
  options?: LLMOptions
): Promise<string> {
  const provider = options?.provider || (options?.deepseekApiKey ? 'deepseek' : 'gemini');
  const dsKey = options?.deepseekApiKey || process.env.DEEPSEEK_API_KEY;
  const dsModel = options?.deepseekModel || 'deepseek-chat';

  // 1. If DeepSeek is chosen and a key is available, call DeepSeek API
  if (provider === 'deepseek' && dsKey) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${dsKey.trim()}`,
        },
        body: JSON.stringify({
          model: dsModel,
          temperature: 0.3,
          response_format: jsonFormat ? { type: 'json_object' } : undefined,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';
        if (text) return text.trim();
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.warn('DeepSeek API warning:', errJson.error?.message || response.statusText);
      }
    } catch (e: any) {
      console.warn('DeepSeek request error, attempting Gemini fallback:', e.message);
    }
  }

  // 2. Call Google Gemini
  if (ai) {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: jsonFormat ? 'application/json' : undefined,
        temperature: 0.3,
      },
    });
    return response.text?.trim() || '';
  }

  throw new Error('No AI service response available');
}

// ------------------------------------------------------------------
// Health / Status Check
// ------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasEnvDeepSeekKey: !!process.env.DEEPSEEK_API_KEY,
    time: new Date().toISOString(),
  });
});

// ------------------------------------------------------------------
// Test DeepSeek API Key Endpoint
// ------------------------------------------------------------------
app.post('/api/test-deepseek', async (req, res) => {
  const { apiKey, model } = req.body;
  const keyToTest = (apiKey || process.env.DEEPSEEK_API_KEY || '').trim();

  if (!keyToTest) {
    return res.status(400).json({ error: 'Please enter a DeepSeek API key (sk-...)' });
  }

  try {
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keyToTest}`,
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        max_tokens: 15,
        messages: [{ role: 'user', content: 'Reply with the word "connected".' }],
      }),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return res.status(400).json({
        error: err.error?.message || `DeepSeek returned HTTP ${r.status}`,
      });
    }

    const data = await r.json();
    return res.json({
      success: true,
      message: data.choices?.[0]?.message?.content || 'Connected successfully!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to connect to DeepSeek API' });
  }
});

// ------------------------------------------------------------------
// 1. Generate Full Chapter Mastery Kit
// ------------------------------------------------------------------
app.post('/api/generate-kit', async (req, res) => {
  const {
    title,
    subject,
    grade,
    difficultyLevel = 'standard',
    text,
    depthMode,
    aiProvider,
    deepseekApiKey,
    deepseekModel,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Chapter title is required' });
  }

  const isInDepth = depthMode !== 'on-the-go';
  const branchCount = isInDepth ? '6 to 10' : '4 to 5';
  const keywordCount = isInDepth ? '12 to 16' : '6 to 8';
  const questionCount = isInDepth ? '5 to 7' : '3 to 4';
  const quizCount = isInDepth ? '8 to 10' : '5 to 6';

  const diffDesc =
    difficultyLevel === 'easy'
      ? 'Foundational / Beginner: Gentle pacing, simple vocabulary, everyday analogies, step-by-step clarity for building confidence.'
      : difficultyLevel === 'hard'
      ? 'Advanced / Honors / Challenge: Deep technical mechanisms, precise vocabulary, high-order reasoning questions, exam-rigor.'
      : 'Standard Grade-Level: Balanced curriculum syllabus, standard exam terminology, clear concepts.';

  const systemInstruction = `You are the "Chapter Mastery Engine" — a premier instructional designer and master teacher trained in Ausubel's Advance Organizer theory, Cognitive Load Theory, Spaced Repetition, and the Feynman Technique.
Target Audience: Grade ${grade || 6} school student.
Difficulty Level: ${difficultyLevel.toUpperCase()} (${diffDesc}).
Language: Clear, inspiring, age-appropriate English. Use vivid, concrete real-world analogies (especially relatable everyday examples).
Subject: ${subject || 'General'}.
You MUST return valid JSON adhering strictly to the requested schema.`;

  const userPrompt = `Build a complete Chapter Mastery Kit for:
CHAPTER: "${title}"
GRADE: ${grade || 6}
SUBJECT: ${subject || 'General'}
DIFFICULTY: ${difficultyLevel.toUpperCase()} (${diffDesc})
DEPTH: ${isInDepth ? 'Comprehensive in-depth mastery' : 'Rapid high-yield review'}

CONTENT & SOURCE MATERIAL:
${
  text && text.trim().length > 10
    ? text.slice(0, 10000)
    : 'No textbook text provided. Autonomously research and generate a comprehensive, curriculum-standard syllabus for this topic suited to Grade ' +
      (grade || 6) +
      ' at ' +
      difficultyLevel +
      ' difficulty.'
}

REQUIREMENTS:
1. "map":
   - "chapterTitle": "${title}"
   - "oneLineSummary": A crystal-clear 1-sentence hook explaining what this chapter is about.
   - "bigIdea": The single most mind-blowing or fundamental truth the student must remember forever.
   - "bigIdeaEmoji": 1 relevant emoji.
   - "bigIdeaAnalogy": A DESCRIPTIVE, super-friendly explainer analogy (2 to 3 sentences) written in the simplest, easiest everyday English words. Start with "Think of it like this: Imagine..." and compare it to a familiar daily life experience so any student instantly understands why it works.
   - "learningOutcomes": 3-4 bullet statements of what the student will conquer.
   - "estimatedStudyMinutes": estimated minutes (15 to 35).
   - "overallDiagram": A step-by-step visual mechanism diagram for the entire chapter.
     Format: {
       "type": "cycle" | "flow" | "steps" | "structure",
       "title": "Clear Diagram Title",
       "caption": "1-sentence summary of what this diagram illustrates",
       "steps": [
         { "label": "Step 1 Name", "desc": "Concise step explanation in simple words", "emoji": "🌱" },
         { "label": "Step 2 Name", "desc": "Concise step explanation in simple words", "emoji": "☀️" },
         { "label": "Step 3 Name", "desc": "Concise step explanation in simple words", "emoji": "💧" },
         { "label": "Step 4 Name", "desc": "Concise step explanation in simple words", "emoji": "✨" }
       ]
     }
   - "recommendedVideos": 1 to 2 curated educational YouTube video recommendations.
     Format: [
       {
         "title": "Engaging Video Title",
         "channel": "Crash Course / Khan Academy / SciShow / Ted-Ed",
         "duration": "8-12 min",
         "youtubeUrl": "https://www.youtube.com/results?search_query=${encodeURIComponent(
           title + ' ' + (subject || 'science') + ' lesson'
         )}",
         "whyWatch": "1 sentence why this video makes the chapter crystal clear"
       }
     ]
   - "branches": Exactly ${branchCount} sequential concept branches. Each branch has:
     - "id": string like "b1"
     - "branchName": clear title
     - "branchEmoji": 1 emoji
     - "analogy": A DESCRIPTIVE, story-like explainer analogy (2 to 3 sentences) using the EASIEST, simplest English words. Must describe a vivid, familiar everyday scenario (like baking cookies, charging a phone battery, boiling water, riding a bicycle, or a playground swing) and clearly explain HOW and WHY this relates to the mechanism.
     - "subPoints": 3 to 4 clear, punchy bullet points explaining the core concepts and mechanisms in plain language.
     - "realLifeExamples": 2 to 3 concrete real-life examples from everyday life (kitchen, playground, human body, gadgets, weather) that prove this concept in action.
     - "mechanisms": [
         {
           "concept": "Core rule or mechanism name",
           "explanation": "Clear explanation in easy words",
           "realLifeExample": "Where you see this in daily life right now",
           "emoji": "🔍"
         }
       ]
     - "keyTakeaways": 2 to 3 essential takeaways to memorize
     - "diagram": (optional but include on at least 1 core branch) a MapDiagram object with 3-4 steps!
     - "video": (optional) a VideoRecommendation object!

2. "keywords": Exactly ${keywordCount} high-yield vocabulary words adapted to ${difficultyLevel} level.
   Each item:
   - "id": string like "k1"
   - "word": vocabulary term
   - "type": "noun", "process", "concept", "person", "place", or "law"
   - "childMeaning": simple definition under 14 words
   - "example": realistic sentence or observation
   - "memoryHook": memorable rhyme, mnemonic, or mental picture
   - "spellingTip": breakdown or mnemonic to prevent spelling mistakes

3. "questions": Exactly ${questionCount} active-recall exam questions matched to ${difficultyLevel} difficulty.
   Include a mix of types: "short-answer", "reasoning", "definition", "diagram".
   Each question has:
   - "id": string like "q1"
   - "type": one of ("short-answer", "reasoning", "definition", "diagram")
   - "question": engaging exam-style prompt
   - "modelAnswer": complete, exemplary answer demonstrating full marks
   - "keyWordsUsed": 3 to 5 key terminology words expected
   - "marks": 2 or 3

4. "quiz": Exactly ${quizCount} varied quiz questions.
   Include a mix of:
   - "mcq" (multiple choice with 4 options, "correctIndex", and clear "explanation")
   - "fill-blank" (sentence with blank, "answer", and "explanation")
   - "match" (3 to 4 pairs with "left" and "right", and "explanation")
   - "true-false" (boolean "answer" and "explanation")`;

  try {
    const rawResult = await executeLLMCall(systemInstruction, userPrompt, true, {
      provider: aiProvider,
      deepseekApiKey,
      deepseekModel,
    });

    const parsed = JSON.parse(rawResult);
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Kit generation error, using fallback:', err.message);
  }

  // Fallback generator when offline or no API key
  const fallback = generateFallbackKit(title, subject, grade, difficultyLevel, text, isInDepth);
  res.json(fallback);
});

// ------------------------------------------------------------------
// 2. Evaluate Student's Written Answer (Active Recall)
// ------------------------------------------------------------------
app.post('/api/evaluate-answer', async (req, res) => {
  const {
    question,
    modelAnswer,
    keyWordsUsed,
    marks,
    studentAnswer,
    aiProvider,
    deepseekApiKey,
    deepseekModel,
  } = req.body;

  if (!studentAnswer || studentAnswer.trim().length < 5) {
    return res.status(400).json({ error: 'Answer is too short' });
  }

  const prompt = `You are a supportive, encouraging, but rigorous school examiner grading a student's answer.
QUESTION: ${question}
MAX MARKS: ${marks || 3}
MODEL ANSWER: ${modelAnswer}
KEY VOCABULARY EXPECTED: ${(keyWordsUsed || []).join(', ')}

STUDENT'S SUBMITTED ANSWER:
"${studentAnswer}"

Evaluate accurately according to standard school marking rubrics:
- Assign an integer score between 0 and ${marks || 3}.
- Provide "whatGood": 1-2 positive sentences highlighting what concepts or facts they grasped correctly.
- Provide "howToImprove": 1-2 constructive sentences on what was missing, vague, or could be worded more precisely.
- Provide "encouragement": 1 warm, motivational sentence.

Return JSON ONLY:
{
  "score": number,
  "maxScore": ${marks || 3},
  "whatGood": string,
  "howToImprove": string,
  "encouragement": string
}`;

  try {
    const rawResult = await executeLLMCall(
      'You are a school examiner evaluating student answers. Return JSON only.',
      prompt,
      true,
      {
        provider: aiProvider,
        deepseekApiKey,
        deepseekModel,
      }
    );

    const parsed = JSON.parse(rawResult);
    return res.json({
      ...parsed,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn('Evaluation error, using fallback:', err.message);
  }

  // Heuristic evaluation fallback
  const words = studentAnswer.trim().toLowerCase().split(/\s+/);
  const matchedKeywords = (keyWordsUsed || []).filter((kw: string) =>
    studentAnswer.toLowerCase().includes(kw.toLowerCase())
  );
  const ratio = matchedKeywords.length / Math.max(1, (keyWordsUsed || []).length);
  const maxScore = marks || 3;
  let score = Math.round(ratio * maxScore);
  if (words.length > 25 && score < maxScore) score = Math.min(maxScore, score + 1);
  if (score < 1 && words.length > 10) score = 1;

  res.json({
    score,
    maxScore,
    whatGood:
      matchedKeywords.length > 0
        ? `Great job mentioning key terms like ${matchedKeywords.join(', ')}! You expressed clear conceptual understanding.`
        : 'You articulated a thoughtful response in your own words.',
    howToImprove:
      matchedKeywords.length < (keyWordsUsed || []).length
        ? `Try to explicitly incorporate more precise scientific terms like: ${(keyWordsUsed || []).filter((k: string) => !matchedKeywords.includes(k)).slice(0, 2).join(', ')}.`
        : 'Include one specific real-world example to make your answer completely watertight.',
    encouragement:
      'Every attempt strengthens neural connections in your brain — keep up the fantastic effort! 🌟',
    evaluatedAt: new Date().toISOString(),
  });
});

// ------------------------------------------------------------------
// 3. Evaluate Student's Retrieval Practice (Advance Map Recall)
// ------------------------------------------------------------------
app.post('/api/evaluate-retrieval', async (req, res) => {
  const {
    targetTitle,
    targetType,
    expectedPoints,
    expectedAnalogy,
    studentRecallText,
    chapterTitle,
    grade,
    aiProvider,
    deepseekApiKey,
    deepseekModel,
  } = req.body;

  if (!studentRecallText || studentRecallText.trim().length < 5) {
    return res.status(400).json({ error: 'Recall text is too short' });
  }

  const prompt = `You are an expert cognitive psychologist evaluating a Grade ${grade || 6} student's "Closed-Book Retrieval Practice" (Brain Dump) following their study of an Advance Organizer Map.
CHAPTER: "${chapterTitle}"
TOPIC BEING RECALLED: "${targetTitle}" (${targetType})
ADVANCE MAP REFERENCE CONTENT:
- Analogy: ${expectedAnalogy || 'N/A'}
- Key Concept Points: ${(expectedPoints || []).join(' | ')}

STUDENT'S RECALLED EXPRESSION:
"${studentRecallText}"

TASK:
Analyze what the student successfully brought out from memory vs what critical nuances they left out.
1. "retrievalScore": An integer from 0 to 100 reflecting how well the core concepts were retrieved.
2. "strengthBadge": One of ("Iron Memory", "Sharp Recall", "Good Recall", "Needs Reinforcement").
3. "recalledPoints": Array of 2 to 4 concise bullet phrases acknowledging specific concepts/terms they remembered.
4. "missedPoints": Array of 1 to 3 concise bullet phrases pointing out important ideas from the Advance Map they forgot to mention.
5. "analogyFeedback": 1 warm sentence on how well they articulated the analogy or real-world comparison.
6. "actionableTip": 1 actionable sentence on what to re-read or visualize.
7. "encouragement": 1 enthusiastic motivational quote celebrating their cognitive effort (retrieval effort builds long-term memory!).

Return JSON ONLY:
{
  "retrievalScore": number,
  "strengthBadge": "Iron Memory" | "Sharp Recall" | "Good Recall" | "Needs Reinforcement",
  "recalledPoints": string[],
  "missedPoints": string[],
  "analogyFeedback": string,
  "actionableTip": string,
  "encouragement": string
}`;

  try {
    const rawResult = await executeLLMCall(
      'You are a cognitive psychologist evaluating retrieval practice. Return JSON only.',
      prompt,
      true,
      {
        provider: aiProvider,
        deepseekApiKey,
        deepseekModel,
      }
    );

    const parsed = JSON.parse(rawResult);
    return res.json({
      ...parsed,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn('Retrieval evaluation error, using fallback:', err.message);
  }

  // Fallback heuristic evaluation
  const words = studentRecallText.trim().toLowerCase().split(/\s+/);
  const foundPoints: string[] = [];
  const missed: string[] = [];

  (expectedPoints || []).forEach((pt: string) => {
    const keyTerms = pt.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const hasOverlap = keyTerms.some((kt) => studentRecallText.toLowerCase().includes(kt));
    if (hasOverlap) {
      foundPoints.push(pt.slice(0, 65));
    } else {
      missed.push(pt.slice(0, 65));
    }
  });

  const scoreRatio = Math.min(
    1,
    Math.max(
      0.35,
      (foundPoints.length + (words.length > 20 ? 1 : 0)) / Math.max(1, (expectedPoints || []).length)
    )
  );
  const finalScore = Math.round(scoreRatio * 100);

  res.json({
    retrievalScore: finalScore,
    strengthBadge:
      finalScore >= 85
        ? 'Iron Memory'
        : finalScore >= 70
        ? 'Sharp Recall'
        : finalScore >= 50
        ? 'Good Recall'
        : 'Needs Reinforcement',
    recalledPoints:
      foundPoints.length > 0
        ? foundPoints.slice(0, 3)
        : ['Expressed core idea in your own natural phrasing'],
    missedPoints: missed.slice(0, 2),
    analogyFeedback:
      studentRecallText.toLowerCase().includes('like') ||
      studentRecallText.toLowerCase().includes('as')
        ? 'Great job relating the concept with a comparison!'
        : 'Try using an everyday "Think of it like..." analogy next time to cement your recall.',
    actionableTip: `Take a 10-second peek back at "${targetTitle}" in Advance Map to lock in the missing points.`,
    encouragement:
      'The cognitive effort of straining to remember builds 3x stronger memory than re-reading! 🧠✨',
    evaluatedAt: new Date().toISOString(),
  });
});

// ------------------------------------------------------------------
// 4. Socratic Study Coach Chat (Sparky)
// ------------------------------------------------------------------
app.post('/api/coach-chat', async (req, res) => {
  const {
    chapterTitle,
    subject,
    grade,
    message,
    history,
    currentContext,
    aiProvider,
    deepseekApiKey,
    deepseekModel,
  } = req.body;

  const systemInstruction = `You are "Sparky", a friendly, witty, and highly supportive Socratic study coach for a Grade ${grade || 6} student.
You are STRICTLY LOCKED to studying the chapter: "${chapterTitle}" in ${subject || 'General'}.

PEDAGOGICAL RULES:
1. Socratic Teaching: Do NOT immediately dump full final answers. When the student asks a question or gets stuck, offer a bite-sized hint or ask a guiding question so their brain makes the connection.
2. Positive & Energetic: Celebrate when they get something right with warmth and excitement.
3. Chapter Boundary: If the student asks something completely off-topic (e.g. video games, celebrities, off-topic trivia), warmly redirect: "Haha, nice try! But right now we're mastering ${chapterTitle}. Tell me, what do you remember about..."
4. Relatable Analogies: Use everyday comparisons (food, sports, cartoons, weather).
5. Always keep responses concise (3-4 sentences maximum), and end with an engaging question or check for understanding.

OUTPUT FORMAT:
Return valid JSON:
{
  "reply": "your supportive response ending with a guiding question",
  "quickQuestions": ["Suggested student follow-up 1", "Suggested student follow-up 2", "Suggested student follow-up 3"]
}`;

  const chatContents = `Context of chapter:
Chapter: "${chapterTitle}"
Subject: ${subject}
Key context summary: ${currentContext ? currentContext.slice(0, 1500) : ''}

Chat history:
${(history || []).map((h: any) => `${h.role === 'user' ? 'Student' : 'Sparky'}: ${h.content}`).join('\n')}

Student just said:
"${message}"`;

  try {
    const rawResult = await executeLLMCall(systemInstruction, chatContents, true, {
      provider: aiProvider,
      deepseekApiKey,
      deepseekModel,
    });

    const parsed = JSON.parse(rawResult);
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Coach chat error, using fallback:', err.message);
  }

  // Fallback response
  res.json({
    reply: `That's an interesting thought about ${chapterTitle}! Think about what happens when the core process takes place. How would you explain that to a 7-year-old friend?`,
    quickQuestions: [
      `Give me a simple analogy for this`,
      `Test me with a quick question!`,
      `What is the most important exam point here?`,
    ],
  });
});

// ------------------------------------------------------------------
// 5. Parse Web URL Text (Safe proxy)
// ------------------------------------------------------------------
app.post('/api/parse-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const fetchRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!fetchRes.ok) {
      return res.json({ label: url, text: `Source link: ${url}` });
    }

    const html = await fetchRes.text();
    // Strip scripts, styles, navs
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const label = titleMatch ? titleMatch[1].trim() : url.replace(/^https?:\/\//, '').split('/')[0];

    res.json({
      label,
      text: cleanText.slice(0, 6000),
    });
  } catch (err: any) {
    res.json({
      label: url.replace(/^https?:\/\//, '').split('/')[0],
      text: `Source link: ${url}\n\n(Extracted reference from URL)`,
    });
  }
});

// Helper for fallback kit generation
function generateFallbackKit(
  title: string,
  subject: string,
  grade: number,
  difficultyLevel: string = 'standard',
  text: string,
  isInDepth: boolean
) {
  const cleanTitle = title || 'Chapter Mastery';
  return {
    map: {
      chapterTitle: cleanTitle,
      oneLineSummary: `Core principles, mechanisms, and key outcomes of ${cleanTitle}.`,
      bigIdea: `Understanding ${cleanTitle} reveals how interconnected principles shape everything around us in ${subject || 'this subject'}.`,
      bigIdeaEmoji: '💡',
      bigIdeaAnalogy: `Think of ${cleanTitle} like building a sturdy Lego tower: each fundamental concept clicks into the next to create a complete understanding.`,
      learningOutcomes: [
        `Master the foundational definitions and scope of ${cleanTitle}`,
        `Understand the step-by-step mechanisms and causes`,
        `Apply knowledge to solve standard exam problems and reasoning questions`,
        `Connect these principles to real-world scenarios`,
      ],
      estimatedStudyMinutes: isInDepth ? 25 : 15,
      overallDiagram: {
        type: 'flow',
        title: `${cleanTitle}: Master Process & Mechanism Flow`,
        caption: 'Sequential visual progression showing causes, state transformations, and observable results.',
        steps: [
          { label: '1. Initial Input', desc: `Underlying elements and environmental conditions initiating ${cleanTitle}.`, emoji: '🌱' },
          { label: '2. Core Transformation', desc: `The active reaction or mechanical phase driven by governing scientific laws.`, emoji: '⚙️' },
          { label: '3. Observable Effect', desc: `Measurable outcome or physical changes visible throughout the system.`, emoji: '⚡' },
          { label: '4. System Equilibrium', desc: `Stabilization, feedback loops, and long-term conservation across the environment.`, emoji: '🌍' },
        ],
      },
      recommendedVideos: [
        {
          title: `${cleanTitle} Explained in 10 Minutes`,
          channel: 'Crash Course / Educational Hub',
          duration: '9:45',
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTitle + ' ' + (subject || 'science') + ' lesson')}`,
          whyWatch: `Visual animations and real-world demonstrations of ${cleanTitle} to cement your visual memory before tests.`,
        },
        {
          title: `${cleanTitle} Fast Review & Exam Prep`,
          channel: 'Khan Academy / Ted-Ed',
          duration: '6:30',
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTitle + ' review lesson')}`,
          whyWatch: `Clear step-by-step breakdowns of common exam problems and core vocabulary.`,
        },
      ],
      branches: [
        {
          id: 'b1',
          branchName: `Foundations of ${cleanTitle}`,
          branchEmoji: '🌱',
          analogy: `Imagine building a towering skyscraper out of toy blocks: before adding any high floors, you must lay a completely flat, solid foundation so nothing wobbles. That is what foundational rules do—they provide the basic definitions and ground rules that make everything else work!`,
          subPoints: [
            `Core definitions and background principles governing ${cleanTitle}.`,
            `Key factors and natural conditions that trigger this phenomenon.`,
            `Why this concept is essential across everyday ${subject || 'learning'}.`,
          ],
          realLifeExamples: [
            `In your kitchen: when water heats in a kettle, the bubbling starts from basic temperature changes at the base.`,
            `On a smartphone: battery chemistry starts with simple positive and negative charges moving across terminals.`,
          ],
          mechanisms: [
            {
              concept: `Initial Condition & Activation`,
              explanation: `A baseline force or energy difference triggers the initial activity.`,
              realLifeExample: `Pushing a swing for the very first time to start its rhythm.`,
              emoji: '🚀',
            },
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
          analogy: `Think of a giant chain reaction of dominoes standing in a row: when the first domino tips over, it passes its energy directly to the next one, and the next, until the whole line moves smoothly. In ${cleanTitle}, each step directly causes the next step without skipping!`,
          subPoints: [
            'Sequential progression from cause to effect.',
            'Crucial reactions, interactions, or structural functions.',
            'How energy, materials, or information flow through the system.',
          ],
          realLifeExamples: [
            `Riding a bicycle: pressing the pedal turns the chain, which spins the gear, which spins the back wheel to push you forward.`,
            `Baking bread: yeast eats sugar, burps tiny pockets of gas, and makes the dough puff up into soft bread in the oven.`,
          ],
          mechanisms: [
            {
              concept: `Cause-and-Effect Chain`,
              explanation: `One physical change produces a predictable reaction in the next component.`,
              realLifeExample: `Squeezing a toothpaste tube pushes the paste forward through the nozzle.`,
              emoji: '🔄',
            },
          ],
          keyTakeaways: [
            'Process flows sequentially from inputs to outputs.',
            'Small changes in conditions lead to observable effects.',
          ],
          diagram: {
            type: 'steps',
            title: 'Mechanical Interaction Breakdown',
            caption: 'Detailed step-by-step breakdown of the core active mechanism.',
            steps: [
              { label: 'Activation', desc: 'Sufficient threshold energy or trigger applied to the system.', emoji: '⚡' },
              { label: 'Interaction', desc: 'Direct engagement between key components and forces.', emoji: '🔄' },
              { label: 'Stabilization', desc: 'System reaches a balanced steady-state outcome.', emoji: '✅' },
            ],
          },
        },
        {
          id: 'b3',
          branchName: 'Real-World Evidence & Applications',
          branchEmoji: '🌍',
          analogy: `Imagine wearing special detective glasses that let you see invisible air currents, heat waves rising off pavement, or tiny water droplets floating in a cloud. Once you learn ${cleanTitle}, you start spotting it happening all around you in everyday life!`,
          subPoints: [
            'Everyday examples where this concept is clearly visible.',
            'Scientific, historical, or environmental significance.',
            'How scientists or researchers verify these principles.',
          ],
          realLifeExamples: [
            `Steaming bathroom mirrors after a warm shower—a direct example of warm vapor cooling into liquid droplets.`,
            `A puddle drying on a sunny sidewalk—the water doesn't vanish into nothing, it evaporates into invisible moisture in the air.`,
          ],
          mechanisms: [
            {
              concept: `Observable Everyday Phenomena`,
              explanation: `Invisible microscopic actions add up into visible macroscopic effects we can touch, see, and measure.`,
              realLifeExample: `Fog rolling over morning grass or dew drops on a spider web.`,
              emoji: '🔍',
            },
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
          analogy: `Think of an airline pilot running through a quick laminated checklist before takeoff: checking each instrument one by one ensures a smooth, worry-free flight. This review gives you the exact mental checklist to score top marks on test day!`,
          subPoints: [
            'Most commonly tested questions in school board exams.',
            'Frequent misconceptions students make and how to avoid them.',
            'Quick formula or mental checklist for full marks.',
          ],
          realLifeExamples: [
            `Double-checking your pencil pouch and calculator before walking into the exam hall.`,
          ],
          keyTakeaways: [
            'Always define keywords before explaining mechanisms.',
            'Review key vocabulary terms during final exam revision.',
          ],
        },
      ]
    },
    keywords: [
      {
        id: 'k1',
        word: cleanTitle.split(' ')[0] || 'Principle',
        type: 'concept',
        childMeaning: `The primary concept or central force in ${cleanTitle}.`,
        example: `We study how ${cleanTitle.split(' ')[0]} works in daily life.`,
        memoryHook: `Remember the root word to instantly recall the definition!`,
        spellingTip: `Break down the syllables carefully.`,
      },
      {
        id: 'k2',
        word: 'Mechanism',
        type: 'process',
        childMeaning: 'The step-by-step way a system works or produces results.',
        example: 'Understanding the mechanism helps explain why changes occur.',
        memoryHook: 'Mechanism = Machine parts working together!',
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
        question: `What is the primary significance of ${cleanTitle} in ${subject}?`,
        modelAnswer: `${cleanTitle} establishes the core mechanisms and principles that govern how systems behave in ${subject}. It connects foundational observations with predictable real-world outcomes.`,
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
        explanation:
          'Scientific and academic principles follow consistent, observable laws that explain cause-and-effect relationships.',
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

// ------------------------------------------------------------------
// Vite Middleware / Static Serving
// ------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Chapter Mastery Kit Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
