import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Play,
  RefreshCw,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { sendChatMessage } from '../services/ai/aiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const StudyCoachView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'explain' | 'plan' | 'quiz'>('explain');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Interactive Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleStudyAction = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    setQuizQuestions([]);
    setUserAnswers({});
    setQuizSubmitted(false);

    let prompt = '';
    if (mode === 'explain') {
      prompt = `You are an encouraging and brilliant academic Study Coach.
Explain this topic simply and intuitively for students in friendly Bengali: "${topic}".
Include:
1. 💡 সহজ ভাষায় মূল ধারণা (Core Concept with a real-world analogy)
2. 🔑 গুরুত্বপূর্ণ বিষয় ও পরিভাষা (Key Terms & Definitions)
3. 📝 ৩টি বাস্তব উদাহরণ (3 Real-world Examples)
4. 🧠 মনে রাখার সহজ টেকনিক বা নেমোনিক (Mnemonics & Memory Hacks)
5. ❓ নিজের রিভিশনের জন্য ৩টি আত্মমূল্যায়ন প্রশ্ন (Self-check Questions)`;
    } else if (mode === 'plan') {
      prompt = `Create a realistic and structured 14-day study plan and daily revision roadmap for mastering this topic: "${topic}".
Include:
- Day-by-day learning milestones
- Recommended daily study hours & pomodoro intervals
- Active recall exercises and mock tests on weekend`;
    } else {
      // Quiz Mode - request structured JSON
      prompt = `Create 4 high-quality Multiple Choice Questions (MCQs) for students on the topic: "${topic}".
You MUST return the output in JSON format wrapped inside a \`\`\`json block with this exact schema:
[
  {
    "question": "Question text in Bengali",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of the correct answer"
  }
]`;
    }

    try {
      const res = await sendChatMessage({
        mode: 'study-coach',
        messages: [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
      });

      if (mode === 'quiz') {
        const jsonMatch = res.text.match(/```(?:json)?\n([\s\S]*?)```/i);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const parsed = JSON.parse(jsonMatch[1].trim());
            if (Array.isArray(parsed) && parsed.length > 0) {
              setQuizQuestions(parsed);
              setOutput('');
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Quiz JSON parse error:', e);
          }
        }
      }
      setOutput(res.text);
    } catch (err: any) {
      setErrorMessage(err.message || 'স্টাডি কোচ রেসপন্স তৈরি করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-400" />
          স্টাডি কোচ (Study Coach)
        </h1>
        <p className="text-xs text-slate-400">
          সহজ ভাষায় যেকোনো পড়া বোঝা, পরীক্ষার স্টাডি প্ল্যান ও ইন্টারঅ্যাক্টিভ কুইজ প্র্যাকটিস।
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('explain')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition ${
            mode === 'explain'
              ? 'bg-emerald-500 text-slate-950 shadow font-bold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>পড়া বুঝুন (Explain)</span>
        </button>

        <button
          onClick={() => setMode('plan')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition ${
            mode === 'plan'
              ? 'bg-emerald-500 text-slate-950 shadow font-bold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>স্টাডি প্ল্যান ও রুটিন</span>
        </button>

        <button
          onClick={() => setMode('quiz')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition ${
            mode === 'quiz'
              ? 'bg-emerald-500 text-slate-950 shadow font-bold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>ইন্টারেক্টিভ কুইজ (MCQ)</span>
        </button>
      </div>

      {/* Topic Input Box */}
      <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-4 space-y-3 shadow-md">
        <label className="text-xs font-semibold text-slate-200">
          কোন বিষয়ে পড়াশোনা করতে চান?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStudyAction()}
            placeholder="যেমন: ফটোসিন্থেসিস, ডেটা স্ট্রাকচার, কোয়ান্টাম ফিজিক্স, বাংলা ব্যাকরণ..."
            className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleStudyAction}
            disabled={isLoading || !topic.trim()}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 shrink-0 ${
              isLoading || !topic.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>প্রস্তুত হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>শুরু করুন</span>
              </>
            )}
          </button>
        </div>

        {/* Quick topics */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs text-slate-400 pt-1">
          <span className="shrink-0 text-slate-500 text-[11px]">টপিক:</span>
          {['জাভাস্ক্রিপ্ট ক্লোজার', 'ব্ল্যাক হোল তত্ত্ব', 'ডিএনএ ও জেনেটিক্স', 'বিশ্বযুদ্ধের কারণসমূহ'].map((s, i) => (
            <button
              key={i}
              onClick={() => setTopic(s)}
              className="whitespace-nowrap hover:text-emerald-400 bg-slate-800 px-2.5 py-0.5 rounded-lg transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-800 p-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Interactive MCQ Quiz Player */}
      {quizQuestions.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> কুইজ টেস্ট: {topic}
            </h3>
            {quizSubmitted && (
              <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                স্কোর: {calculateScore()} / {quizQuestions.length}
              </span>
            )}
          </div>

          <div className="space-y-6">
            {quizQuestions.map((q, qIdx) => {
              const selectedOpt = userAnswers[qIdx];
              return (
                <div key={qIdx} className="space-y-3 text-xs">
                  <div className="font-semibold text-slate-100 text-sm flex gap-2">
                    <span className="text-emerald-400">{qIdx + 1}.</span>
                    <span>{q.question}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedOpt === optIdx;
                      const isCorrect = q.correctIndex === optIdx;

                      let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';
                      if (isChosen) {
                        btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                      }
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-900/60 border-emerald-400 text-emerald-200 font-bold';
                        } else if (isChosen && !isCorrect) {
                          btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {quizSubmitted && isChosen && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && q.explanation && (
                    <div className="pl-4 text-[11px] text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                      💡 <strong>ব্যাখ্যা:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            {!quizSubmitted ? (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(userAnswers).length === 0}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-white transition active:scale-95 disabled:bg-slate-800 disabled:text-slate-500"
              >
                উত্তর সাবমিট করুন
              </button>
            ) : (
              <button
                onClick={handleStudyAction}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition"
              >
                নতুন কুইজ খেলুন
              </button>
            )}
          </div>
        </div>
      )}

      {/* Explanation or Plan Output */}
      {output && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            স্টাডি গাইড ও টিপস
          </h3>
          <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-5 shadow-2xl">
            <MarkdownRenderer content={output} />
          </div>
        </div>
      )}
    </div>
  );
};
