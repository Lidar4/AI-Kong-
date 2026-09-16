import express from 'express';
import path from 'path';
import fs from 'fs';
import vm from 'vm';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Helper to get Gemini client
function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const key = customApiKey || process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Mode system prompts for unified orchestration
const MODE_PROMPTS: Record<string, string> = {
  'home': `You are "সর্বকাজ AI বন্ধু" (AI Bondhu) — an intelligent, empathetic, multi-disciplinary personal AI assistant and workspace companion.
Language Guidelines:
- You natively understand Bengali (বাংলা), Banglish (Bengali written in English letters), and English.
- Answer primarily in clear, natural, and helpful Bengali by default, while keeping code, technical terms, and English queries in their standard English or bilingual format when appropriate.
- Maintain an encouraging, respectful, friendly, and productive tone ("তুমি/আপনি" respectful and warm).
- Format your response with clear Markdown, headings, bullet points, and code blocks.`,

  'ai-chat': `You are "সর্বকাজ AI বন্ধু" (AI Bondhu) in General AI Chat mode.
Capabilities:
- Assist in general Q&A, brainstorming, problem solving, creative ideas, and daily queries.
- Understand Bengali, Banglish, and English seamlessly.
- Provide crisp, well-structured answers using clean Markdown.
- If code is needed, use properly fenced markdown code blocks with language tags.`,

  'code-master': `You are "Code Master" (কোড মাস্টার) in সর্বকাজ AI বন্ধু.
Purpose: Elite programming and software engineering assistant.
Capabilities:
- Write clean, modern, secure, and production-ready code.
- Explain code line-by-line with simple terminology.
- Refactor, optimize, and explain algorithmic complexity.
- Support languages: HTML, CSS, JavaScript, TypeScript, Python, Java, Kotlin, C, C++, SQL, JSON, Bash, Go, Rust, PHP, etc.
- When explaining errors, pinpoint the exact line, root cause, and the corrected version.
- Always wrap complete code solutions in markdown code blocks (\`\`\`language ... \`\`\`).
- If asked in Bengali/Banglish, provide explanations in Bengali and keep the code clean in English.`,

  'web-pro': `You are "Web Pro" (ওয়েব প্রো) in সর্বকাজ AI বন্ধু.
Purpose: Frontend, Web development, and UI engineering specialist.
Capabilities:
- Generate complete, responsive, self-contained single-page HTML/CSS/JS or modern React/Tailwind layouts.
- When asked to build a website (e.g. "একটা HTML website বানাও"), output clean, valid, modern code.
- Provide interactive, accessible, and responsive components (Landing pages, Dashboards, Forms, Cards, Navbars).
- Include inline comments explaining CSS and JS behavior.`,

  'python-lab': `You are "Python Lab" (পাইথন ল্যাব) in সর্বকাজ AI বন্ধু.
Purpose: Python learning, data scripting, and automation workspace.
Capabilities:
- Write idiomatic Python 3 (PEP 8 compliant, type hints where helpful).
- Analyze Python scripts for syntax errors, logical bugs, and performance bottlenecks.
- Explain standard library and popular packages (pandas, numpy, requests, flask, fastapi, etc.).
- Clearly label code analysis versus expected console output. Do not pretend you ran arbitrary system commands unless explaining expected output.`,

  'debug-detective': `You are "Debug Detective" (ডিবাগ ডিটেকটিভ) in সর্বকাজ AI বন্ধু.
Purpose: Systematic diagnostic and bug resolution assistant.
When analyzing provided code, error messages, or logs, you MUST structure your answer into these 5 clear sections:
1. 🎯 সমস্যা (The Problem): Concise summary of what went wrong.
2. 🔍 কারণ (Root Cause): Technical explanation of why the bug occurred.
3. 🛠️ সমাধান (The Fix): Conceptual approach to solve it safely.
4. 💻 সংশোধিত কোড (Corrected Code): Complete fixed code snippet in a markdown block.
5. 💡 অতিরিক্ত টিপস ও ব্যাখ্যা (Explanation & Best Practices): How to avoid similar bugs in the future.`,

  'app-builder': `You are "App Builder" (অ্যাপ বিল্ডার) in সর্বকাজ AI বন্ধু.
Purpose: End-to-end application architecture and implementation planner.
Workflow to guide the user:
1. 💡 ধারণা ও উদ্দেশ্য (Idea & Goals)
2. 📋 ফিচার ও রিকোয়ারমেন্টস (Feature Checklist)
3. 🏗️ আর্কিটেকচার ও টেক-স্ট্যাক (System Architecture & Tech Stack)
4. 📁 ফাইল ও ফোল্ডার স্ট্রাকচার (Clean Project Structure)
5. 💻 কোর কোড ও কনফিগারেশন (Core Implementation Code)
6. 🧪 টেস্টিং চেকলিস্ট (Testing Steps)
7. 🚀 ডিপ্লয়মেন্ট গাইড (Deployment Instructions for Netlify, Vercel, Cloud Run, etc.)
Be honest and realistic; never claim an APK is built unless an actual compilation service runs.`,

  'data-sage': `You are "Data Sage" (ডাটা সেইজ) in সর্বকাজ AI বন্ধু.
Purpose: Data analysis, dataset interpretation, and statistical insights.
Capabilities:
- Analyze CSV, JSON, tables, and raw text datasets provided by the user.
- Detect columns, data types, missing values, anomalies, and statistical summaries (mean, median, range).
- Explain trends and correlation in clear language.
- Suggest formulas (Excel/Google Sheets/SQL) and visualization ideas (bar charts, line graphs, pie charts).
- Provide clean Python/Pandas or JavaScript snippets to clean and transform the dataset.`,

  'design-mate': `You are "Design Mate" (ডিজাইন মেট) in সর্বকাজ AI বন্ধু.
Purpose: UI/UX design, visual identity, and design system consultant.
Capabilities:
- Recommend aesthetic color palettes with exact HEX codes, contrast ratios, and semantic roles (primary, surface, accent).
- Suggest modern typography pairings, layout grids, spacing hierarchies, and micro-interactions.
- Formulate UX recommendations (accessibility WCAG AA, mobile ergonomics, reduced friction).
- When requested, craft prompt engineering descriptions for design and image generation tools.
- Do NOT generate images automatically unless the user explicitly requests image generation.`,

  'study-coach': `You are "Study Coach" (স্টাডি কোচ) in সর্বকাজ AI বন্ধু.
Purpose: Personalized educational coach and academic tutor.
Capabilities:
- Explain complex concepts simply with intuitive real-world analogies in Bengali and English.
- Generate structured study schedules, revision roadmaps, and spaced repetition milestones.
- Create interactive multiple-choice quizzes (MCQs) with answers and detailed rationales.
- Provide step-by-step problem breakdowns for science, math, computer science, literature, and general studies.
- Use encouraging, age-appropriate, and supportive educational language.`,

  'writing-friend': `You are "Writing Friend" (রাইটিং ফ্রেন্ড) in সর্বকাজ AI বন্ধু.
Purpose: Creative and professional writing companion.
Capabilities:
- Proofread, edit, and polish Bengali and English drafts for grammar, syntax, flow, and clarity.
- Adjust tone: Formal / Professional, Friendly / Casual, Academic, Persuasive, or Poetic.
- Draft professional emails, cover letters, essays, blog posts, YouTube video titles, descriptions, tags, and social captions.
- Accurate translation between Bengali, Banglish, and English with idiomatic preservation.`,

  'research-guide': `You are "Research Guide" (রিসার্চ গাইড) in সর্বকাজ AI বন্ধু.
Purpose: Academic and strategic research assistant.
Capabilities:
- Decompose complex research questions into structured sub-hypotheses and inquiry trees.
- Organize sources, compare viewpoints, synthesize literature, and create structured outlines.
- Never fabricate sources or citations. If a specific paper or real-time event cannot be confirmed, explicitly declare so.`,

  'life-planner': `You are "Life Planner" (লাইফ প্ল্যানার) in সর্বকাজ AI বন্ধু.
Purpose: Personal productivity, time management, and routine organizer.
Capabilities:
- Create actionable daily/weekly schedules, prioritized to-do lists, and time-blocking templates.
- Break ambitious long-term goals into realistic weekly sprints and daily habits.
- Note: Provide practical productivity tools and checklists, without claiming medical, psychological, or certified professional advisory.`,

  'language-buddy': `You are "Language Buddy" (ল্যাঙ্গুয়েজ বাডি) in সর্বকাজ AI বন্ধু.
Purpose: Language tutor and bilingual conversational partner.
Capabilities:
- Bengali ↔ English learning, vocabulary acquisition, and grammatical mastery.
- Interpret Banglish sentences and translate into standard Bengali script and refined English.
- Explain grammatical rules (tense, prepositions, verb agreements, idioms) with bilingual examples.
- Offer conversational roleplay and phonetic pronunciation tips.`,
};

// Safe workspace manager for self-coding capabilities
const SAFE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.html', '.json', '.md', '.svg'];
const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', '.cache'];

function isPathSafe(relativePath: string): boolean {
  if (!relativePath || typeof relativePath !== 'string') return false;
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
  if (normalized.includes('..') || path.isAbsolute(relativePath)) return false;
  if (normalized.startsWith('node_modules') || normalized.startsWith('.git') || normalized.startsWith('dist')) return false;
  const ext = path.extname(normalized);
  if (normalized !== 'index.html' && normalized !== 'package.json' && !SAFE_EXTENSIONS.includes(ext)) {
    return false;
  }
  return true;
}

function listWorkspaceFiles(dir = '.', baseDir = '.'): Array<{ path: string; size: number; modified: number }> {
  const result: Array<{ path: string; size: number; modified: number }> = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (EXCLUDED_DIRS.includes(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
          result.push(...listWorkspaceFiles(fullPath, baseDir));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (SAFE_EXTENSIONS.includes(ext) || entry.name === 'index.html') {
          const stat = fs.statSync(fullPath);
          result.push({
            path: relPath,
            size: stat.size,
            modified: stat.mtimeMs,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error listing workspace files:', err);
  }
  return result;
}

const workspaceHistory: Array<{ filePath: string; explanation: string; timestamp: number }> = [];

// Tool declarations for Gemini Native Plugins and Self-Code ability
const listFilesTool: FunctionDeclaration = {
  name: 'list_project_files',
  description: 'List all editable project source code files (e.g. src/App.tsx, src/index.css, index.html) in the current website workspace.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const readFileTool: FunctionDeclaration = {
  name: 'read_project_file',
  description: 'Read the source code of any file in the workspace so you can inspect it before modifying it.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      filePath: {
        type: Type.STRING,
        description: 'Relative path to file, e.g. "src/App.tsx" or "src/index.css"',
      },
    },
    required: ['filePath'],
  },
};

const writeFileTool: FunctionDeclaration = {
  name: 'write_project_file',
  description: 'Update or modify the code of a project file. Use this whenever the user asks to change the design, colors, styles, texts, buttons, layout, or features of this website.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      filePath: {
        type: Type.STRING,
        description: 'Relative path to file, e.g. "src/App.tsx" or "src/index.css"',
      },
      content: {
        type: Type.STRING,
        description: 'The full updated source code to write to the file.',
      },
      explanation: {
        type: Type.STRING,
        description: 'A clear, short explanation in Bengali of what change was made.',
      },
    },
    required: ['filePath', 'content'],
  },
};

const runMathOrCodeTool: FunctionDeclaration = {
  name: 'run_math_or_code',
  description: 'Execute mathematical calculations or safe JavaScript algorithms/scripts in a sandbox without needing external APIs. Use this whenever the user asks to calculate formulas, math problems, simulations, algorithms, or process numeric data.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      expressionOrCode: {
        type: Type.STRING,
        description: 'The JavaScript code or math expression to evaluate, e.g. "Math.sqrt(144) * 25" or a function returning a result.',
      },
      explanation: {
        type: Type.STRING,
        description: 'Short description in Bengali of what is being computed.',
      },
    },
    required: ['expressionOrCode'],
  },
};

const createTaskPlannerTool: FunctionDeclaration = {
  name: 'create_task_planner',
  description: 'Generate an interactive, structured step-by-step task plan or roadmap (ChatGPT-like planning system) for any user goal, project, learning path, or daily workflow without external APIs.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      goal: {
        type: Type.STRING,
        description: 'The main goal or objective of the plan in Bengali or English.',
      },
      timeframe: {
        type: Type.STRING,
        description: 'Estimated total timeframe or schedule, e.g. "৭ দিন", "১ মাস", "আজকের দিন"',
      },
      milestones: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.STRING, description: 'Step title/name' },
            details: { type: Type.STRING, description: 'Step details and action items' },
            priority: { type: Type.STRING, description: 'উচ্চ | মাঝারি | সাধারণ' },
            duration: { type: Type.STRING, description: 'Time needed, e.g. "২ ঘণ্টা"' },
          },
        },
        description: 'Array of sequential milestones or steps to complete the goal.',
      },
    },
    required: ['goal', 'milestones'],
  },
};

const analyzeTextDataTool: FunctionDeclaration = {
  name: 'analyze_text_data',
  description: 'Analyze text, JSON, or structured data metrics (word count, reading duration, syntax validation, key takeaway points) without external APIs.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      content: {
        type: Type.STRING,
        description: 'The text or JSON string to analyze.',
      },
      format: {
        type: Type.STRING,
        description: 'Format: "text" | "json" | "csv"',
      },
    },
    required: ['content'],
  },
};

const smartConverterTool: FunctionDeclaration = {
  name: 'smart_converter',
  description: 'Perform instant accurate conversion between units (weight, length, temperature, digital bytes, etc.) without external APIs.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      value: { type: Type.NUMBER, description: 'Value to convert' },
      fromUnit: { type: Type.STRING, description: 'Source unit (e.g. "km", "mile", "kg", "lbs", "celsius", "fahrenheit", "gb", "mb")' },
      toUnit: { type: Type.STRING, description: 'Target unit' },
    },
    required: ['value', 'fromUnit', 'toUnit'],
  },
};

const ALL_AVAILABLE_TOOLS = [
  listFilesTool,
  readFileTool,
  writeFileTool,
  runMathOrCodeTool,
  createTaskPlannerTool,
  analyzeTextDataTool,
  smartConverterTool,
];

const CHATBOT_CORE_SYSTEM_PROMPT = `তুমি "সর্বকাজ AI বন্ধু" (AI Bondhu) — একটি অত্যন্ত গোছানো, সহজ, বহুমুখী এবং বুদ্ধিমান বাংলা AI চ্যাটবট।

তোমার মূল উদ্দেশ্য ও বৈশিষ্ট্যসমূহ:
1. সর্বজনীন সহায়ক (Universal Assistant):
   - ব্যবহারকারীর সাথে পরিষ্কার, মার্জিত ও বন্ধুত্বপূর্ণ বাংলায় কথা বলো ("তুমি" বা "আপনি" সমীহপূর্ণ ও আন্তরিক ভঙ্গি)।
   - যেকোনো প্রশ্ন, পড়ালেখা, কোডিং সমস্যা, আইডিয়া তৈরি, বিশ্লেষণ বা সাধারণ আড্ডায় সরাসরি সাহায্য করো।
   - অপ্রয়োজনীয় বাধা বা অজুহাত এড়িয়ে সরাসরি কাজের উপযোগী সমাধান ও তথ্যবহুল উত্তর দাও।
   - পরিচ্ছন্ন মার্কডাউন (হেডিং, বুলেট পয়েন্ট, বোল্ড টেক্সট, কোড ব্লক ও টেবিল) ব্যবহার করো।

2. অভ্যন্তরীণ প্লাগইন ও টুলস আর্কিটেকচার (ChatGPT-style Native Plugins without external APIs):
   - তোমার নিজস্ব অভ্যন্তরীণ প্লাগইন আর্কিটেকচার রয়েছে যা কোনো থার্ড পার্টি বা পেইড API ছাড়া সরাসরি ব্যাকএন্ডে কাজ করে:
     * run_math_or_code: জটিল গাণিতিক হিসাব বা কোড অ্যালগরিদম স্যান্ডবক্সে এক্সিকিউট করে নির্ভুল ফলাফল বের করা।
     * create_task_planner: যেকোনো কাজ বা প্রজেক্টের জন্য কাঠামোগত ধাপে ধাপে প্ল্যানিং, মাইলস্টোন ও চেকলিস্ট তৈরি করা।
     * analyze_text_data: লেখা বা JSON ডেটার পরিসংখ্যান, রিডিং টাইম ও গঠন বিশ্লেষণ করা।
     * smart_converter: ইউনিট ও পরিমাপের নির্ভুল রূপান্তর করা।
     * সেলফ-কোডিং টুলস: list_project_files, read_project_file, write_project_file দিয়ে সাইটের কোড পড়া ও পরিবর্তন করা।
   - ব্যবহারকারীর চাহিদা অনুযায়ী উপযুক্ত প্লাগইনগুলো স্বয়ংক্রিয়ভাবে কল করো এবং তথ্যবহুল ফলাফল প্রদান করো।

3. স্বয়ংক্রিয় সোর্স কোড পরিবর্তন (Self-Code Ability):
   - যখন ব্যবহারকারী তোমাকে ওয়েবসাইটের রূপ, থিম, বাটন, টেক্সট, ব্যাকগ্রাউন্ড রঙ বা নতুন কোনো ফিচার যোগ/পরিবর্তন করতে বলে:
     a) প্রয়োজনে \`list_project_files\` ও \`read_project_file\` দিয়ে ফাইল পড়ে নাও।
     b) \`write_project_file\` কল করে কোড আপডেট করো।
     c) পরিবর্তন দেখতে ব্রাউজার পেজটি রিলোড করতে বলো।`;

// API Routes
app.get('/api/health', (req, res) => {
  const isKeySet = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
  res.json({
    status: 'ok',
    aiStatus: isKeySet ? 'Ready' : 'API Key Required',
    geminiConfigured: isKeySet,
    provider: 'Gemini',
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/config', (req, res) => {
  const isKeySet = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
  res.json({
    geminiConfigured: isKeySet,
    defaultProvider: 'gemini',
    defaultModel: 'gemini-3.6-flash',
    providers: [
      {
        id: 'gemini',
        name: 'Google Gemini',
        status: isKeySet ? 'connected' : 'not_configured',
        models: [
          { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash (সুপার ফাস্ট ও নির্ভরযোগ্য)', default: true },
          { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (লেটেস্ট সংস্করণ)' },
          { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (উন্নত কোডিং ও বিশ্লেষণ)' },
          { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (কম্প্যাক্ট)' },
        ],
      },
      {
        id: 'openai',
        name: 'OpenAI (Architecture Ready)',
        status: 'not_configured',
        models: [
          { id: 'gpt-4o', name: 'GPT-4o' },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
        ],
      },
      {
        id: 'anthropic',
        name: 'Anthropic (Architecture Ready)',
        status: 'not_configured',
        models: [
          { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
          { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku' },
        ],
      },
    ],
  });
});

app.post('/api/test-key', async (req, res) => {
  try {
    const { apiKey, provider, model } = req.body;
    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({ success: false, message: 'API Key প্রদান করা হয়নি।' });
    }

    if (provider && provider !== 'gemini') {
      return res.status(400).json({
        success: false,
        message: `${provider} প্রোভাইডার আর্কিটেকচার যুক্ত আছে, কিন্তু বর্তমান লাইভ ব্যাকএন্ডে শুধুমাত্র Gemini সক্রিয় রয়েছে।`,
      });
    }

    const testAi = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const candidateModels = [
      model || 'gemini-3.6-flash',
      'gemini-3.8-flash',
      'gemini-3.1-pro-preview',
    ];

    let response: any = null;
    let lastErr: any = null;

    for (const cand of candidateModels) {
      try {
        response = await testAi.models.generateContent({
          model: cand,
          contents: 'Ping test. Reply with: "OK"',
        });
        if (response && response.text) break;
      } catch (err: any) {
        lastErr = err;
        const msg = err?.message || '';
        if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
          continue;
        }
        throw err;
      }
    }

    if (response && response.text) {
      return res.json({ success: true, message: 'API সংযোগ সফল হয়েছে!' });
    } else {
      throw lastErr || new Error('মডেল থেকে কোনো উত্তর পাওয়া যায়নি।');
    }
  } catch (err: any) {
    console.error('API Key test error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'API সংযোগ পরীক্ষা ব্যর্থ হয়েছে। কী সঠিক কিনা যাচাই করুন।',
    });
  }
});

app.get('/api/workspace/files', (req, res) => {
  try {
    const files = listWorkspaceFiles('.');
    res.json({ success: true, files });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/workspace/file', (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath || !isPathSafe(filePath)) {
    return res.status(400).json({ error: 'অবৈধ বা নিষিদ্ধ ফাইল পাথ।' });
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'ফাইলটি পাওয়া যায়নি।' });
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ success: true, path: filePath, content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspace/edit', (req, res) => {
  const { path: filePath, content, explanation } = req.body;
  if (!filePath || !isPathSafe(filePath) || typeof content !== 'string') {
    return res.status(400).json({ error: 'অবৈধ ফাইল বা কোড কনটেন্ট।' });
  }
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    const record = {
      filePath,
      explanation: explanation || 'সরাসরি কোড এডিটর থেকে আপডেট করা হয়েছে',
      timestamp: Date.now(),
    };
    workspaceHistory.unshift(record);
    res.json({ success: true, path: filePath, message: 'ফাইল সফলভাবে সংরক্ষিত হয়েছে।' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workspace/history', (req, res) => {
  res.json({ success: true, history: workspaceHistory.slice(0, 30) });
});

app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      mode = 'ai-chat',
      model = 'gemini-3.6-flash',
      customApiKey,
      temperature,
      attachments = [],
      enableSelfCode = true,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'বার্তা পাওয়া যায়নি (No messages provided).' });
    }

    const ai = getGeminiClient(customApiKey);
    if (!ai) {
      return res.status(400).json({
        error: 'AI API সংযুক্ত করা হয়নি। অনুগ্রহ করে সেটিংসে আপনার Gemini API কী প্রদান করুন অথবা সার্ভার এনভায়রনমেন্ট ভেরিয়েবল কনফিগার করুন।',
        code: 'API_KEY_MISSING',
      });
    }

    // Determine system instruction
    const baseSystemPrompt = CHATBOT_CORE_SYSTEM_PROMPT;
    const currentModeName = mode;

    // Convert conversation history into contents format
    const contents: any[] = [];
    const recentMessages = messages.slice(-16);
    
    for (let i = 0; i < recentMessages.length; i++) {
      const msg = recentMessages[i];
      const isLast = i === recentMessages.length - 1;
      const role = msg.role === 'user' ? 'user' : 'model';

      if (isLast && role === 'user' && attachments && attachments.length > 0) {
        const parts: any[] = [];
        for (const att of attachments) {
          if (att.data && att.mimeType && att.mimeType.startsWith('image/')) {
            parts.push({
              inlineData: {
                data: att.data.replace(/^data:image\/[a-z]+;base64,/, ''),
                mimeType: att.mimeType,
              },
            });
          } else if (att.text) {
            parts.push({
              text: `[সংযুক্ত ফাইল: ${att.name}]\n${att.text}\n`,
            });
          }
        }
        parts.push({ text: msg.content });
        contents.push({ role, parts });
      } else {
        contents.push({
          role,
          parts: [{ text: msg.content }],
        });
      }
    }

    const requestedModel = model || 'gemini-3.6-flash';
    const candidateModels = [
      requestedModel,
      requestedModel === 'gemini-3.6-flash' ? 'gemini-3.8-flash' : 'gemini-3.6-flash',
    ];

    const tools = [{
      functionDeclarations: enableSelfCode
        ? ALL_AVAILABLE_TOOLS
        : [runMathOrCodeTool, createTaskPlannerTool, analyzeTextDataTool, smartConverterTool],
    }];

    let initialResponse: any = null;
    let usedModel = requestedModel;
    let lastError: any = null;

    for (const candModel of candidateModels) {
      try {
        usedModel = candModel;
        initialResponse = await ai.models.generateContent({
          model: candModel,
          contents,
          config: {
            systemInstruction: baseSystemPrompt,
            temperature: typeof temperature === 'number' ? temperature : 0.6,
            tools,
          },
        });
        if (initialResponse) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE') || msg.includes('NOT_FOUND')) {
          console.warn(`[AI Bondhu] Model ${candModel} unavailable or high demand. Trying fallback...`);
          continue;
        }
        throw err;
      }
    }

    if (!initialResponse && lastError) {
      throw lastError;
    }

    const modifiedFiles: Array<{ filePath: string; explanation: string; timestamp: number }> = [];
    const executedPlugins: Array<{ name: string; title: string; icon?: string; summary: string; details?: any }> = [];
    let currentResponse = initialResponse;
    const conversationContents = [...contents];

    // Tool calling execution loop (up to 4 steps)
    if (currentResponse) {
      for (let step = 0; step < 4; step++) {
        const functionCalls = currentResponse.functionCalls;
        if (!functionCalls || functionCalls.length === 0) {
          break;
        }

        // Push model candidate content with function call
        if (currentResponse.candidates && currentResponse.candidates[0]?.content) {
          conversationContents.push(currentResponse.candidates[0].content);
        }

        // Execute each function call
        for (const call of functionCalls) {
          let toolResult: any = { error: 'Unknown function' };

          if (call.name === 'list_project_files') {
            const files = listWorkspaceFiles('.').map((f) => f.path);
            toolResult = { files };
            executedPlugins.push({
              name: 'list_project_files',
              title: 'সোর্স ফাইল তালিকা',
              icon: '📁',
              summary: `${files.length}টি ফাইলের তালিকা দেখা হয়েছে`,
              details: { count: files.length, files: files.slice(0, 15) },
            });
          } else if (call.name === 'read_project_file') {
            const targetPath = call.args?.filePath;
            if (targetPath && isPathSafe(targetPath) && fs.existsSync(targetPath)) {
              try {
                const fileContent = fs.readFileSync(targetPath, 'utf-8');
                toolResult = { filePath: targetPath, content: fileContent };
                executedPlugins.push({
                  name: 'read_project_file',
                  title: 'কোড ফাইল পরিদর্শন',
                  icon: '📖',
                  summary: `'${targetPath}' ফাইলের কোড পড়া হয়েছে (${fileContent.length} অক্ষর)`,
                  details: { filePath: targetPath },
                });
              } catch (readErr: any) {
                toolResult = { error: `পড়ার সময় ত্রুটি: ${readErr.message}` };
              }
            } else {
              toolResult = { error: `ফাইল '${targetPath}' পাওয়া যায়নি বা নিরাপত্তা সীমার বাইরে।` };
            }
          } else if (call.name === 'write_project_file') {
            const { filePath: targetPath, content: newContent, explanation: changeExpl } = call.args || {};
            if (targetPath && typeof newContent === 'string' && isPathSafe(targetPath)) {
              try {
                const dir = path.dirname(targetPath);
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(targetPath, newContent, 'utf-8');
                const modRecord = {
                  filePath: targetPath,
                  explanation: changeExpl || 'সরাসরি কোড আপডেট করা হয়েছে',
                  timestamp: Date.now(),
                };
                modifiedFiles.push(modRecord);
                workspaceHistory.unshift(modRecord);
                toolResult = {
                  success: true,
                  filePath: targetPath,
                  message: `ফাইল '${targetPath}' সফলভাবে আপডেট করা হয়েছে।`,
                };
                executedPlugins.push({
                  name: 'write_project_file',
                  title: 'সেলফ-কোড পরিবর্তন',
                  icon: '✨',
                  summary: `'${targetPath}' কোড আপডেট করা হয়েছে`,
                  details: { filePath: targetPath, explanation: changeExpl },
                });
              } catch (writeErr: any) {
                toolResult = { error: `লেখার সময় ত্রুটি: ${writeErr.message}` };
              }
            } else {
              toolResult = { error: `ফাইল পাথ '${targetPath}' অবৈধ বা নিষিদ্ধ।` };
            }
          } else if (call.name === 'run_math_or_code') {
            const { expressionOrCode, explanation } = call.args || {};
            try {
              const sandbox = {
                Math,
                Number,
                String,
                Array,
                Object,
                parseInt,
                parseFloat,
                JSON,
                Date,
              };
              const script = new vm.Script(expressionOrCode);
              const context = vm.createContext(sandbox);
              const output = script.runInContext(context, { timeout: 1500 });
              toolResult = {
                success: true,
                input: expressionOrCode,
                result: output !== undefined ? String(output) : 'Executed successfully',
                explanation: explanation || 'গণিত/কোড হিসাব সম্পন্ন হয়েছে',
              };
              executedPlugins.push({
                name: 'run_math_or_code',
                title: 'গণিত ও কোড রানার',
                icon: '🧮',
                summary: `হিসাব: ${expressionOrCode} ➔ ${output}`,
                details: toolResult,
              });
            } catch (evalErr: any) {
              toolResult = {
                success: false,
                input: expressionOrCode,
                error: evalErr.message,
              };
              executedPlugins.push({
                name: 'run_math_or_code',
                title: 'গণিত ও কোড রানার',
                icon: '🧮',
                summary: `হিসাবে ত্রুটি: ${evalErr.message}`,
                details: toolResult,
              });
            }
          } else if (call.name === 'create_task_planner') {
            const { goal, timeframe, milestones } = call.args || {};
            toolResult = {
              success: true,
              goal,
              timeframe: timeframe || 'অনির্দিষ্ট',
              milestonesCount: Array.isArray(milestones) ? milestones.length : 0,
              milestones,
            };
            executedPlugins.push({
              name: 'create_task_planner',
              title: 'টাস্ক ও স্টেপ প্ল্যানার',
              icon: '📋',
              summary: `${goal || 'পরিকল্পনা'} (${Array.isArray(milestones) ? milestones.length : 0}টি ধাপ)`,
              details: toolResult,
            });
          } else if (call.name === 'analyze_text_data') {
            const { content: textContent, format } = call.args || {};
            const textStr = String(textContent || '');
            const wordCount = textStr.trim() ? textStr.trim().split(/\s+/).length : 0;
            const charCount = textStr.length;
            const lineCount = textStr.split('\n').length;
            const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));
            let jsonValid: boolean | undefined = undefined;
            let jsonKeysCount: number | undefined = undefined;
            if (format === 'json' || textStr.trim().startsWith('{') || textStr.trim().startsWith('[')) {
              try {
                const parsed = JSON.parse(textStr);
                jsonValid = true;
                jsonKeysCount = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 1;
              } catch {
                jsonValid = false;
              }
            }
            toolResult = {
              success: true,
              wordCount,
              charCount,
              lineCount,
              readingTimeMinutes,
              jsonValid,
              jsonKeysCount,
            };
            executedPlugins.push({
              name: 'analyze_text_data',
              title: 'টেক্সট ও ডেটা অ্যানালাইজার',
              icon: '📊',
              summary: `${wordCount}টি শব্দ • ${charCount} অক্ষর • আনুমানিক ${readingTimeMinutes} মিনিট পড়ার সময়`,
              details: toolResult,
            });
          } else if (call.name === 'smart_converter') {
            const { value, fromUnit, toUnit } = call.args || {};
            const val = Number(value);
            const from = String(fromUnit || '').toLowerCase().trim();
            const to = String(toUnit || '').toLowerCase().trim();
            let convertedVal: number | null = null;
            let unitType = 'unknown';

            // Length map to meters
            const lengthToMeters: Record<string, number> = {
              m: 1, meter: 1, meters: 1, মিটার: 1,
              km: 1000, kilometer: 1000, কিলোমিটার: 1000,
              cm: 0.01, centimeter: 0.01, সেন্টিমিটার: 0.01,
              mm: 0.001, millimeter: 0.001, মিলিমিটার: 0.001,
              mile: 1609.34, miles: 1609.34, মাইল: 1609.34,
              foot: 0.3048, feet: 0.3048, ft: 0.3048, ফুট: 0.3048,
              inch: 0.0254, inches: 0.0254, in: 0.0254, ইঞ্চি: 0.0254,
            };

            // Weight map to grams
            const weightToGrams: Record<string, number> = {
              g: 1, gram: 1, grams: 1, গ্রাম: 1,
              kg: 1000, kilogram: 1000, কেজি: 1000, কিলোগ্রাম: 1000,
              mg: 0.001, milligram: 0.001, মিলিগ্রাম: 0.001,
              lb: 453.592, lbs: 453.592, pound: 453.592, পাউন্ড: 453.592,
              oz: 28.3495, ounce: 28.3495, আউন্স: 28.3495,
              ton: 1000000, tonne: 1000000, টন: 1000000,
            };

            // Digital bytes map
            const bytesMap: Record<string, number> = {
              b: 1, byte: 1, bytes: 1, বাইট: 1,
              kb: 1024, kilobyte: 1024, কিলোবাইট: 1024,
              mb: 1024 * 1024, megabyte: 1024 * 1024, মেগাবাইট: 1024 * 1024,
              gb: 1024 * 1024 * 1024, gigabyte: 1024 * 1024 * 1024, গিগাবাইট: 1024 * 1024 * 1024,
              tb: 1024 * 1024 * 1024 * 1024, terabyte: 1024 * 1024 * 1024 * 1024, টেরাবাইট: 1024 * 1024 * 1024 * 1024,
            };

            if (lengthToMeters[from] && lengthToMeters[to]) {
              unitType = 'length';
              const meters = val * lengthToMeters[from];
              convertedVal = meters / lengthToMeters[to];
            } else if (weightToGrams[from] && weightToGrams[to]) {
              unitType = 'weight';
              const grams = val * weightToGrams[from];
              convertedVal = grams / weightToGrams[to];
            } else if (bytesMap[from] && bytesMap[to]) {
              unitType = 'storage';
              const bytes = val * bytesMap[from];
              convertedVal = bytes / bytesMap[to];
            } else if (
              (from.includes('c') || from.includes('সেলসিয়াস')) &&
              (to.includes('f') || to.includes('ফারেনহাইট'))
            ) {
              unitType = 'temperature';
              convertedVal = (val * 9) / 5 + 32;
            } else if (
              (from.includes('f') || from.includes('ফারেনহাইট')) &&
              (to.includes('c') || to.includes('সেলসিয়াস'))
            ) {
              unitType = 'temperature';
              convertedVal = ((val - 32) * 5) / 9;
            }

            toolResult = {
              success: convertedVal !== null,
              value: val,
              fromUnit: from,
              toUnit: to,
              convertedValue: convertedVal !== null ? Number(convertedVal.toFixed(4)) : null,
              unitType,
            };

            executedPlugins.push({
              name: 'smart_converter',
              title: 'স্মার্ট কনভার্টার',
              icon: '🔄',
              summary: `${val} ${from} = ${convertedVal !== null ? Number(convertedVal.toFixed(4)) : 'N/A'} ${to}`,
              details: toolResult,
            });
          }

          // Feed function result back to model with role 'user'
          conversationContents.push({
            role: 'user',
            parts: [{
              functionResponse: {
                name: call.name,
                response: toolResult,
              },
            }],
          });
        }

        // Call model with tool responses
        currentResponse = await ai.models.generateContent({
          model: usedModel,
          contents: conversationContents,
          config: {
            systemInstruction: baseSystemPrompt,
            temperature: typeof temperature === 'number' ? temperature : 0.6,
            tools,
          },
        });
      }
    }

    const replyText = currentResponse?.text || 'কোনো উত্তর তৈরি করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';

    return res.json({
      success: true,
      text: replyText,
      mode: currentModeName,
      model: usedModel,
      provider: 'Gemini',
      codeChanges: modifiedFiles,
      executedPlugins,
    });
  } catch (error: any) {
    console.error('Server chat generation error:', error);
    const errorMessage = error?.message || '';

    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid api key')) {
      return res.status(401).json({
        error: 'প্রদত্ত Gemini API কী সঠিক নয়। দয়া করে সেটিংসে সঠিক কী প্রবেশ করান।',
        details: errorMessage,
      });
    }

    if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('rate limit')) {
      return res.status(429).json({
        error: 'API রিকোয়েস্টের কোটা সাময়িকভাবে শেষ হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।',
        details: errorMessage,
      });
    }

    return res.status(500).json({
      error: 'AI সার্ভারের সাথে যোগাযোগে সমস্যা হয়েছে। সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।',
      details: errorMessage,
    });
  }
});

// Vite dev middleware or static serve in production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Bondhu] Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
