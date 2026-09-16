import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  RefreshCw,
  Clock,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { sendChatMessage } from '../services/ai/aiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

const DEFAULT_TODOS: TodoItem[] = [
  { id: '1', text: 'প্রজেক্টের মূল কোড রিভিউ করা', completed: false, priority: 'high' },
  { id: '2', text: '৩০ মিনিট নতুন প্রযুক্তি নিয়ে পড়াশোনা', completed: true, priority: 'medium' },
  { id: '3', text: 'শরীরচর্চা বা সান্ধ্যকালীন হাঁটা', completed: false, priority: 'low' },
];

export const LifePlannerView: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem('ai_bondhu_todos');
      return saved ? JSON.parse(saved) : DEFAULT_TODOS;
    } catch {
      return DEFAULT_TODOS;
    }
  });

  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // AI Schedule Planner
  const [scheduleGoal, setScheduleGoal] = useState('');
  const [aiSchedule, setAiSchedule] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ai_bondhu_todos', JSON.stringify(todos));
    } catch (e) {
      console.error(e);
    }
  }, [todos]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      priority: newTodoPriority,
    };
    setTodos([newItem, ...todos]);
    setNewTodoText('');
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const handleGenerateSchedule = async () => {
    if (!scheduleGoal.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    const pendingTasks = todos.filter((t) => !t.completed).map((t) => t.text).join(', ');

    const prompt = `Act as an elite personal productivity coach.
User Goal for today: "${scheduleGoal}"
Current pending tasks: "${pendingTasks || 'General productive work'}"

Create an optimal daily time-blocking schedule in friendly Bengali:
1. ⏰ সকালের রুটিন ও ডিপ ওয়ার্ক ব্লক (Morning Deep Work 8:00 AM - 12:00 PM)
2. 🍽️ বিরতি ও রিচার্জ (Lunch & Recharge 12:00 PM - 1:30 PM)
3. 💼 বিকালের অ্যাডমিন ও ক্রিয়েটিভ ব্লক (Afternoon Admin & Light Tasks 1:30 PM - 5:00 PM)
4. 🏃 স্বাস্থ্য ও সেলফ-কেয়ার (Evening Fitness & Offline Leisure 5:30 PM - 8:00 PM)
5. 🌙 রিফ্লেকশন ও আগামীকালের প্রস্তুতি (Night Wind-down)
Include 3 high-impact productivity rules to avoid burnout.`;

    try {
      const res = await sendChatMessage({
        mode: 'life-planner',
        messages: [{ id: '1', role: 'user', content: prompt, timestamp: Date.now() }],
      });
      setAiSchedule(res.text);
    } catch (err: any) {
      setErrorMessage(err.message || 'শিডিউল তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-emerald-400" />
          লাইফ প্ল্যানার (Life Planner)
        </h1>
        <p className="text-xs text-slate-400">
          দৈনিক টু-ডু চেকলিস্ট, টাইম-ব্লকিং শিডিউল ও ব্যক্তিগত প্রোডাক্টিভিটি ট্র্যাকার।
        </p>
      </div>

      {/* Grid: Interactive Todo List & AI Time-Blocking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Interactive To-Do Checklist */}
        <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-4 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                আজকের টু-ডু চেকলিস্ট
              </h2>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {completedCount}/{todos.length} সম্পন্ন
              </span>
            </div>

            {/* Add Todo Form */}
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="নতুন কাজের নাম লিখুন..."
                className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <select
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(e.target.value as any)}
                className="rounded-xl bg-slate-900 border border-slate-700 px-2 text-xs text-slate-300"
              >
                <option value="high">জরুরি</option>
                <option value="medium">স্বাভাবিক</option>
                <option value="low">কম</option>
              </select>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white p-2 shrink-0 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Todo Items */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    todo.completed
                      ? 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                      : 'bg-slate-900/90 border-slate-700/60 text-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTodo(todo.id)}
                    className="flex items-center gap-2.5 text-left truncate flex-1"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-xs truncate ${todo.completed ? 'line-through' : 'font-medium'}`}>
                      {todo.text}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        todo.priority === 'high'
                          ? 'bg-rose-500/15 text-rose-400'
                          : todo.priority === 'medium'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {todo.priority === 'high' ? 'জরুরি' : todo.priority === 'medium' ? 'স্বাভাবিক' : 'কম'}
                    </span>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Time-Blocking Generator */}
        <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-4 space-y-3 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            AI টাইম-ব্লকিং শিডিউল প্ল্যানার
          </h2>
          <p className="text-xs text-slate-400">
            আজকে কোন বিষয়ে সবচেয়ে বেশি ফোকাস করতে চান তা বলুন:
          </p>

          <textarea
            rows={3}
            value={scheduleGoal}
            onChange={(e) => setScheduleGoal(e.target.value)}
            placeholder="যেমন: ৩ ঘণ্টা প্রোগ্রামিং প্রজেক্টের কাজ এবং ২ ঘণ্টা পরীক্ষার পড়া শেষ করা..."
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <div className="flex justify-end">
            <button
              onClick={handleGenerateSchedule}
              disabled={isLoading || !scheduleGoal.trim()}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 ${
                isLoading || !scheduleGoal.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>রুটিন তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>আজকের শিডিউল তৈরি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-800 p-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* AI Schedule Output */}
      {aiSchedule && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            আপনার অপটিমাল দৈনিক শিডিউল
          </h3>
          <div className="rounded-2xl bg-[#0f172a] border border-slate-800 p-5 shadow-2xl">
            <MarkdownRenderer content={aiSchedule} />
          </div>
        </div>
      )}
    </div>
  );
};
