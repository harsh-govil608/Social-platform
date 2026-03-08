import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2, XCircle, Clock, Loader2, Flame, Zap, BookOpen,
  Brain, ChevronRight, ChevronLeft, RotateCcw, Sparkles,
  Trophy, Star, Target, Award, History, Calendar, TrendingUp,
} from "lucide-react";
import axiosInstance from "../lib/axios";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

// ─── localStorage helpers ─────────────────────────────────────────────────────

const HISTORY_KEY = "langpal_vocab_history";

const loadHistory = () => {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
};

const saveSession = (session) => {
  try {
    const history = loadHistory();
    history.unshift(session); // newest first
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30))); // keep last 30
  } catch { /* ignore */ }
};

// ─── utils ────────────────────────────────────────────────────────────────────

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const buildQuiz = (words) => {
  if (!words || words.length < 2) return [];
  const translations = words.map((w) => w.translation);
  return shuffle(words).map((word) => {
    const wrong = shuffle(translations.filter((t) => t !== word.translation)).slice(0, 3);
    return {
      word: word.word,
      answer: word.translation,
      options: shuffle([word.translation, ...wrong]),
      pronunciation: word.pronunciation,
      category: word.category,
    };
  });
};

const diffColor = (d) => d <= 1 ? "badge-success" : d <= 2 ? "badge-warning" : "badge-error";
const diffLabel = (d) => d <= 1 ? "Easy" : d <= 2 ? "Medium" : "Hard";
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const pctColor = (p) => p >= 70 ? "text-success" : p >= 40 ? "text-warning" : "text-error";
const pctBg   = (p) => p >= 70 ? "bg-success"   : p >= 40 ? "bg-warning"   : "bg-error";

// ─── Study Screen ─────────────────────────────────────────────────────────────

const StudyScreen = ({ words, onFinish }) => {
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(new Set([0]));
  const word = words[index];

  const go = (dir) => {
    const next = index + dir;
    if (next < 0 || next >= words.length) return;
    setIndex(next);
    setSeen((s) => new Set([...s, next]));
  };

  const jumpTo = (i) => {
    setIndex(i);
    setSeen((s) => new Set([...s, i]));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-base-content/50">Word <span className="font-bold text-base-content">{index + 1}</span> of {words.length}</span>
          <span className="text-primary font-semibold">{seen.size}/{words.length} studied</span>
        </div>
        <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / words.length) * 100}%` }}
          />
        </div>
        {/* Dot nav */}
        <div className="flex flex-wrap gap-1 justify-center pt-1">
          {words.map((_, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === index ? "w-4 h-2.5 bg-primary" :
                seen.has(i) ? "w-2.5 h-2.5 bg-primary/40" : "w-2.5 h-2.5 bg-base-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="card bg-gradient-to-br from-base-100 to-base-200 border-2 border-base-300 shadow-xl">
        <div className="card-body items-center text-center gap-4 py-8 px-6">
          <div className="flex gap-2 flex-wrap justify-center">
            {word.category && <span className="badge badge-outline badge-sm capitalize">{word.category}</span>}
            {word.difficulty && <span className={`badge badge-sm ${diffColor(word.difficulty)}`}>{diffLabel(word.difficulty)}</span>}
          </div>

          <div>
            <h2 className="text-5xl font-extrabold tracking-tight">{word.word}</h2>
            {word.pronunciation && (
              <p className="text-base-content/40 text-sm mt-1 font-mono">/{word.pronunciation}/</p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full max-w-xs">
            <div className="flex-1 h-px bg-base-300" />
            <BookOpen className="size-4 text-primary opacity-40" />
            <div className="flex-1 h-px bg-base-300" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-base-content/40 mb-1">Meaning</p>
            <p className="text-3xl font-bold text-primary">{word.translation}</p>
          </div>

          {word.example && (
            <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 w-full text-left">
              <p className="text-xs text-primary/50 uppercase tracking-wider mb-0.5">Example</p>
              <p className="text-sm italic text-base-content/70">"{word.example}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button className="btn btn-outline btn-lg flex-1 gap-1" onClick={() => go(-1)} disabled={index === 0}>
          <ChevronLeft className="size-5" /> Prev
        </button>
        {index < words.length - 1 ? (
          <button className="btn btn-primary btn-lg flex-1 gap-1" onClick={() => go(1)}>
            Next <ChevronRight className="size-5" />
          </button>
        ) : (
          <button className="btn btn-success btn-lg flex-1 gap-2" onClick={onFinish}>
            <Brain className="size-5" /> Take Quiz
          </button>
        )}
      </div>
      <p className="text-center text-xs text-base-content/30 italic">Tap dots to jump to any word</p>
    </div>
  );
};

// ─── Quiz Screen ──────────────────────────────────────────────────────────────

const QuizScreen = ({ questions, onFinish }) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const answersRef = useRef([]); // use ref to avoid stale closure issues
  const timerRef = useRef(null);

  const q = questions[index];
  const correct = answersRef.current.filter(Boolean).length;

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const pick = (opt) => {
    if (revealed) return;
    const isCorrect = opt === q.answer;
    const updated = [...answersRef.current, isCorrect];
    answersRef.current = updated;
    setSelected(opt);
    setRevealed(true);

    timerRef.current = setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1);
        setSelected(null);
        setRevealed(false);
      } else {
        onFinish([...updated]); // pass a copy
      }
    }, 900);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-base-content/50">Question <span className="font-bold text-base-content">{index + 1}</span> of {questions.length}</p>
          <div className="flex gap-0.5">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                i < answersRef.current.length
                  ? answersRef.current[i] ? "bg-success w-5" : "bg-error w-5"
                  : i === index ? "bg-primary w-5" : "bg-base-300 w-3"
              }`} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-success/10 px-3 py-1.5 rounded-full">
          <Star className="size-4 text-success" />
          <span className="text-success font-bold text-sm">{correct}</span>
        </div>
      </div>

      {/* Question */}
      <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/15 shadow-lg">
        <div className="card-body items-center text-center py-8 gap-2">
          <p className="text-xs uppercase tracking-widest text-base-content/40">What does this mean?</p>
          <h3 className="text-4xl font-extrabold">{q.word}</h3>
          {q.pronunciation && <p className="text-base-content/30 font-mono text-sm">/{q.pronunciation}/</p>}
          {q.category && <span className="badge badge-outline badge-sm capitalize mt-1">{q.category}</span>}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {q.options.map((opt, i) => {
          const isCorrectOpt = opt === q.answer;
          const isSelectedOpt = opt === selected;
          let cls = "btn w-full justify-start text-left normal-case h-auto py-4 px-5 font-medium text-base transition-all duration-200";
          if (!revealed) cls += " btn-outline hover:btn-primary hover:scale-[1.01]";
          else if (isCorrectOpt) cls += " btn-success";
          else if (isSelectedOpt) cls += " btn-error";
          else cls += " btn-outline opacity-25 pointer-events-none";

          return (
            <button key={opt} className={cls} onClick={() => pick(opt)}>
              <span className="inline-flex items-center gap-3 w-full">
                <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold shrink-0">
                  {["A","B","C","D"][i]}
                </span>
                <span className="flex-1">{opt}</span>
                {revealed && isCorrectOpt && <CheckCircle2 className="size-5 shrink-0" />}
                {revealed && isSelectedOpt && !isCorrectOpt && <XCircle className="size-5 shrink-0" />}
              </span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <p className={`text-center font-semibold ${selected === q.answer ? "text-success" : "text-error"}`}>
          {selected === q.answer ? "✓ Correct!" : `✗ Answer: "${q.answer}"`}
        </p>
      )}
    </div>
  );
};

// ─── Results Screen ───────────────────────────────────────────────────────────

const ResultsScreen = ({ questions, answers, xpEarned, onReplay, onHome, loading }) => {
  const [animPct, setAnimPct] = useState(0);
  const correct = answers.filter(Boolean).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);

  const grade =
    pct === 100 ? { emoji: "🏆", label: "Perfect score!" } :
    pct >= 80   ? { emoji: "🎉", label: "Excellent!" }     :
    pct >= 60   ? { emoji: "👍", label: "Good job!" }      :
    pct >= 40   ? { emoji: "💪", label: "Keep going!" }    :
                  { emoji: "📚", label: "Study more!" };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="text-6xl">{grade.emoji}</div>
        <h2 className={`text-2xl font-extrabold ${pctColor(pct)}`}>{grade.label}</h2>

        {/* SVG ring */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-base-300" />
              <circle
                cx="60" cy="60" r="50" fill="none" strokeWidth="10" strokeLinecap="round"
                className={pctColor(pct)}
                stroke="currentColor"
                strokeDasharray={String(2 * Math.PI * 50)}
                strokeDashoffset={String(2 * Math.PI * 50 * (1 - animPct / 100))}
                style={{ transition: "stroke-dashoffset 1s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold">{pct}%</span>
              <span className="text-xs text-base-content/50">{correct}/{total}</span>
            </div>
          </div>
        </div>

        {xpEarned > 0 && (
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 px-4 py-2 rounded-full font-bold">
            <Zap className="size-4" />+{xpEarned} XP earned
          </div>
        )}
      </div>

      {/* Word breakdown */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-base-content/40 font-medium">Word Breakdown</p>
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          {questions.map((q, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
              answers[i] ? "bg-success/5 border-success/20" : "bg-error/5 border-error/20"
            }`}>
              {answers[i]
                ? <CheckCircle2 className="size-4 text-success shrink-0" />
                : <XCircle className="size-4 text-error shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{q.word}</p>
                <p className={`text-xs truncate ${answers[i] ? "text-success/70" : "text-error/70"}`}>{q.answer}</p>
              </div>
              {!answers[i] && <span className="badge badge-error badge-xs shrink-0">Missed</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="btn btn-outline gap-2" onClick={onReplay}>
          <RotateCcw className="size-4" /> Try Again
        </button>
        <button className="btn btn-primary gap-2" onClick={onHome} disabled={loading}>
          {loading ? <Loader2 className="animate-spin size-4" /> : <><CheckCircle2 className="size-4" /> Done</>}
        </button>
      </div>
    </div>
  );
};

// ─── History Screen ───────────────────────────────────────────────────────────

const HistoryScreen = () => {
  const history = useMemo(() => loadHistory(), []);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <History className="size-10 text-base-content/20" />
        <p className="font-semibold text-base-content/50">No sessions yet</p>
        <p className="text-sm text-base-content/40">Complete a quiz to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Sessions", value: history.length, icon: Calendar },
          { label: "Avg Score", value: `${Math.round(history.reduce((a, s) => a + s.score, 0) / history.length)}%`, icon: TrendingUp },
          { label: "Total XP", value: `+${history.reduce((a, s) => a + (s.xp || 0), 0)}`, icon: Zap },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card bg-base-200 py-3">
            <div className="card-body items-center p-0 gap-1">
              <Icon className="size-4 text-primary" />
              <p className="text-lg font-extrabold">{value}</p>
              <p className="text-xs text-base-content/50">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Session list */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {history.map((session, i) => (
          <div key={i} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4 gap-3">
              {/* Session header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">
                    {new Date(session.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  <p className="text-xs text-base-content/40">
                    {new Date(session.date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    {session.elapsed ? ` · ${fmt(session.elapsed)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {session.xp > 0 && (
                    <span className="badge badge-warning badge-sm gap-1">
                      <Zap className="size-3" />+{session.xp}
                    </span>
                  )}
                  <div className={`radial-progress text-sm font-bold ${pctColor(session.score)}`}
                    style={{ "--value": session.score, "--size": "3rem", "--thickness": "3px" }}
                    aria-label={`${session.score}%`}>
                    {session.score}%
                  </div>
                </div>
              </div>

              {/* Word results */}
              <div className="flex flex-wrap gap-1.5">
                {session.words.map((w, j) => (
                  <span key={j} className={`badge badge-sm gap-1 ${w.correct ? "badge-success" : "badge-error"} badge-outline`}>
                    {w.correct ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                    {w.word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── XP Burst ────────────────────────────────────────────────────────────────

const XPBurst = ({ xp }) => (
  <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
    <div className="animate-bounce text-6xl font-extrabold text-yellow-400 drop-shadow-2xl select-none">+{xp} XP</div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = ["study", "quiz", "results", "history"];

const DailyTaskPage = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [apiStep, setApiStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [phase, setPhase] = useState("study");
  // Store results in a ref so they survive re-renders triggered by state updates
  const quizAnswersRef = useRef([]);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState("practice"); // 'practice' | 'history'

  // Freeze quiz so re-renders don't reshuffle it
  const quizRef = useRef(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/daily-task/today");
        setTask(res.data.task);
        setApiStep(res.data.currentStep);
      } catch {
        toast.error("Failed to load today's task");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "results" || loading) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase, loading]);

  // ── words & quiz (frozen in ref after first build) ─────────────────────────
  const words = task?.content?.words || [];

  if (words.length > 0 && !quizRef.current) {
    quizRef.current = buildQuiz(words);
  }
  const quiz = quizRef.current || [];

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleStudyFinish = () => {
    // Fire-and-forget start task
    axiosInstance.post("/daily-task/start").catch(() => {});
    setPhase("quiz");
  };

  const handleQuizFinish = (answers) => {
    const correct = answers.filter(Boolean).length;
    const total = answers.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const xp = Math.round(50 * (score / 100));

    // Update state — no async, no API calls that could disrupt rendering
    quizAnswersRef.current = answers;
    setQuizAnswers([...answers]);
    setEarnedXP(xp);
    setPhase("results");

    if (xp > 0) {
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1800);
    }

    // Save to history
    const session = {
      date: new Date().toISOString(),
      score,
      xp,
      elapsed,
      words: quiz.map((q, i) => ({ word: q.word, translation: q.answer, correct: answers[i] ?? false })),
    };
    saveSession(session);

    // Background API — no state updates, pure fire-and-forget
    (async () => {
      try {
        await axiosInstance.post("/daily-task/complete-ai-practice", {
          feedback: "Vocabulary quiz completed",
          corrections: [],
          timeSpent: elapsed,
          score,
        });
        await axiosInstance.post("/daily-task/partner-interaction", { accepted: false, durationSeconds: 0 }).catch(() => {});
        await axiosInstance.post("/daily-task/complete").catch(() => {});
      } catch { /* silent */ }
    })();
  };

  const handleHome = async () => {
    setActionLoading(true);
    try {
      await axiosInstance.post("/daily-task/complete").catch(() => {});
    } finally {
      setActionLoading(false);
    }
    navigate("/");
  };

  const handleReplay = () => {
    quizRef.current = buildQuiz(words); // reshuffle for replay
    quizAnswersRef.current = [];
    setQuizAnswers([]);
    setEarnedXP(0);
    setElapsed(0);
    setPhase("study");
  };

  // ── derived ────────────────────────────────────────────────────────────────
  const isCompleted = apiStep === "completed";
  const phaseIndex = ["study", "quiz", "results"].indexOf(phase);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin size-10 text-primary" />
        <p className="text-base-content/60">Loading today's words…</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <BookOpen className="size-12 text-primary/40" />
        <h2 className="text-xl font-bold">No vocabulary words found</h2>
        <p className="text-base-content/60 max-w-sm">No words available for your learning language.</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      {showXP && <XPBurst xp={earnedXP} />}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Daily Vocabulary</h1>
          <p className="text-sm text-base-content/50">
            {isCompleted ? "✓ Completed today — keep practicing!" : `${words.length} words · up to +50 XP`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 rounded-full">
            <Flame className="size-4 text-orange-500" />
            <span className="font-bold text-orange-500 text-sm">{authUser?.streak || 0}d streak</span>
          </div>
          {phase !== "results" && (
            <span className="text-xs text-base-content/40 pr-1 font-mono">{fmt(elapsed)}</span>
          )}
        </div>
      </div>

      {/* ── Top nav tabs ── */}
      <div className="flex gap-2">
        <button
          className={`btn btn-sm flex-1 gap-1.5 ${activeTab === "practice" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setActiveTab("practice")}
        >
          <BookOpen className="size-4" /> Practice
        </button>
        <button
          className={`btn btn-sm flex-1 gap-1.5 ${activeTab === "history" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setActiveTab("history")}
        >
          <History className="size-4" /> History
        </button>
      </div>

      {/* ── Practice content ── */}
      {activeTab === "practice" && (
        <>
          {/* Phase indicator */}
          {phase !== "results" && (
            <div className="flex gap-0 rounded-xl overflow-hidden border border-base-300">
              {[
                { key: "study",   label: "Study",   icon: BookOpen },
                { key: "quiz",    label: "Quiz",     icon: Brain },
                { key: "results", label: "Results",  icon: Trophy },
              ].map(({ key, label, icon: Icon }, i) => (
                <div key={key} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold ${
                  phase === key ? "bg-primary text-primary-content" :
                  i < phaseIndex ? "bg-success/10 text-success" : "bg-base-200 text-base-content/40"
                }`}>
                  {i < phaseIndex ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
                  {label}
                </div>
              ))}
            </div>
          )}

          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body gap-4">
              {phase === "study" && (
                <StudyScreen words={words} onFinish={handleStudyFinish} />
              )}
              {phase === "quiz" && quiz.length > 0 && (
                <QuizScreen questions={quiz} onFinish={handleQuizFinish} />
              )}
              {phase === "results" && (
                <ResultsScreen
                  questions={quiz}
                  answers={quizAnswers}
                  xpEarned={earnedXP}
                  onReplay={handleReplay}
                  onHome={handleHome}
                  loading={actionLoading}
                />
              )}
            </div>
          </div>

          <p className="text-center text-xs text-base-content/30 italic">
            {phase === "study"   && "Study all words, then take the quiz to earn XP."}
            {phase === "quiz"    && "Pick the correct translation — score higher for more XP!"}
            {phase === "results" && "Review missed words, try again to improve your score."}
          </p>
        </>
      )}

      {/* ── History tab ── */}
      {activeTab === "history" && (
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body gap-4">
            <HistoryScreen />
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTaskPage;
