import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

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

// Unified LLM caller for Vercel Serverless
async function executeLLMCall(
  systemInstruction: string,
  userPrompt: string,
  jsonFormat: boolean,
  options?: {
    provider?: 'gemini' | 'deepseek';
    deepseekApiKey?: string;
    deepseekModel?: string;
  }
): Promise<string> {
  const provider = options?.provider || (options?.deepseekApiKey ? 'deepseek' : 'gemini');
  const dsKey = options?.deepseekApiKey || process.env.DEEPSEEK_API_KEY;
  const dsModel = options?.deepseekModel || 'deepseek-chat';

  // 1. DeepSeek if selected
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
      }
    } catch (e: any) {
      console.warn('DeepSeek error on Vercel:', e.message);
    }
  }

  // 2. Gemini
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

  throw new Error('No AI service available on Vercel');
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.url || '';

  // 1. Generate Kit
  if (url.includes('/generate-kit')) {
    const { title, subject, grade, text, depthMode, aiProvider, deepseekApiKey, deepseekModel } =
      req.body || {};

    if (!title) {
      return res.status(400).json({ error: 'Chapter title is required' });
    }

    const isInDepth = depthMode !== 'on-the-go';
    const branchCount = isInDepth ? '6 to 10' : '4 to 5';
    const keywordCount = isInDepth ? '12 to 16' : '6 to 8';
    const questionCount = isInDepth ? '5 to 7' : '3 to 4';
    const quizCount = isInDepth ? '8 to 10' : '5 to 6';

    const systemInstruction = `You are the "Chapter Mastery Engine" — a premier instructional designer and master teacher trained in Ausubel's Advance Organizer theory, Cognitive Load Theory, Spaced Repetition, and the Feynman Technique.
Target Audience: Grade ${grade || 6} school student.
Language: Clear, inspiring, age-appropriate English. Use vivid, concrete real-world analogies.
Subject: ${subject || 'General'}.
Return valid JSON only.`;

    const userPrompt = `Build a complete Chapter Mastery Kit for:
CHAPTER: "${title}"
GRADE: ${grade || 6}
SUBJECT: ${subject || 'General'}
DEPTH: ${isInDepth ? 'In-Depth' : 'On-The-Go'}
CONTENT: ${text ? text.slice(0, 10000) : 'Standard curriculum concepts.'}
Return valid JSON with:
1. "map": { "chapterTitle": "${title}", "oneLineSummary": "...", "bigIdea": "...", "bigIdeaEmoji": "💡", "bigIdeaAnalogy": "...", "learningOutcomes": ["..."], "estimatedStudyMinutes": 20, "branches": [{"id":"b1","branchName":"...","branchEmoji":"📌","analogy":"...","subPoints":["..."],"keyTakeaways":["..."]}] } (${branchCount} branches)
2. "keywords": [{"id":"k1","word":"...","type":"concept","childMeaning":"...","example":"...","memoryHook":"...","spellingTip":"..."}] (${keywordCount} items)
3. "questions": [{"id":"q1","type":"short-answer","question":"...","modelAnswer":"...","keyWordsUsed":["..."],"marks":3}] (${questionCount} items)
4. "quiz": [{"id":"qz1","type":"mcq","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}] (${quizCount} items)`;

    try {
      const raw = await executeLLMCall(systemInstruction, userPrompt, true, {
        provider: aiProvider,
        deepseekApiKey,
        deepseekModel,
      });
      return res.json(JSON.parse(raw));
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Generation failed on Vercel' });
    }
  }

  // 2. Evaluate Answer
  if (url.includes('/evaluate-answer')) {
    const { question, modelAnswer, keyWordsUsed, marks, studentAnswer, aiProvider, deepseekApiKey, deepseekModel } =
      req.body || {};

    const prompt = `Grade student answer against rubric:
QUESTION: ${question}
MAX MARKS: ${marks || 3}
MODEL ANSWER: ${modelAnswer}
KEY WORDS EXPECTED: ${(keyWordsUsed || []).join(', ')}
STUDENT SUBMITTED: "${studentAnswer}"

Return JSON:
{ "score": number, "maxScore": ${marks || 3}, "whatGood": "...", "howToImprove": "...", "encouragement": "..." }`;

    try {
      const raw = await executeLLMCall('You are a school examiner. Return JSON only.', prompt, true, {
        provider: aiProvider,
        deepseekApiKey,
        deepseekModel,
      });
      return res.json({ ...JSON.parse(raw), evaluatedAt: new Date().toISOString() });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // 3. Test DeepSeek
  if (url.includes('/test-deepseek')) {
    const { apiKey, model } = req.body || {};
    const keyToTest = (apiKey || process.env.DEEPSEEK_API_KEY || '').trim();
    if (!keyToTest) return res.status(400).json({ error: 'DeepSeek API key required' });

    try {
      const r = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToTest}`,
        },
        body: JSON.stringify({
          model: model || 'deepseek-chat',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Say "connected"' }],
        }),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        return res.status(400).json({ error: err.error?.message || `HTTP ${r.status}` });
      }
      return res.json({ success: true, message: 'Connected to DeepSeek!' });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(200).json({ status: 'ok', environment: 'vercel' });
}
