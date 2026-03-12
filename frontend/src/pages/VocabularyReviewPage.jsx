import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Brain, BookOpen, Loader2, PartyPopper, Target,
  Plus, Search, Trash2, CheckCircle2, Clock, RotateCcw,
  Flame, Star, TrendingUp, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';

// ─── CSS for 3D flip (injected once) ─────────────────────────────────────────
const FLIP_STYLE = `
.flashcard-scene { perspective: 1000px; }
.flashcard { transition: transform 0.55s cubic-bezier(.4,0,.2,1); transform-style: preserve-3d; position: relative; }
.flashcard.flipped { transform: rotateY(180deg); }
.flashcard-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.flashcard-back  { transform: rotateY(180deg); }
`;

// ─── Rating config ────────────────────────────────────────────────────────────
const RATINGS = [
  { value: 0, label: 'Forgot',  emoji: '😶', bg: 'bg-red-500/15',    text: 'text-red-500',    border: 'border-red-500/40' },
  { value: 1, label: 'Hard',    emoji: '😰', bg: 'bg-orange-500/15', text: 'text-orange-500', border: 'border-orange-500/40' },
  { value: 2, label: 'Unsure',  emoji: '🤔', bg: 'bg-yellow-500/15', text: 'text-yellow-500', border: 'border-yellow-500/40' },
  { value: 3, label: 'Good',    emoji: '👍', bg: 'bg-blue-500/15',   text: 'text-blue-500',   border: 'border-blue-500/40' },
  { value: 4, label: 'Easy',    emoji: '😊', bg: 'bg-green-500/15',  text: 'text-green-500',  border: 'border-green-500/40' },
  { value: 5, label: 'Perfect', emoji: '🌟', bg: 'bg-primary/15',    text: 'text-primary',    border: 'border-primary/40' },
];

// ─── Flashcard Review ─────────────────────────────────────────────────────────
const ReviewTab = () => {
  const [reviews, setReviews] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [doneToday, setDoneToday] = useState(false);
  const [hasNoWords, setHasNoWords] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const r = await axiosInstance.get('/vocabulary/today-session');
      setSession(r.data.session);
    } catch { /* ignore */ }
  }, []);

  const fetchDue = useCallback(async () => {
    try {
      const r = await axiosInstance.get('/vocabulary/due-reviews-limited');
      const data = r.data.reviews || [];
      setReviews(data);
      setDoneToday(r.data.isDoneForToday);
      setIdx(0);
      setFlipped(false);
      if (data.length === 0 && !r.data.isDoneForToday) {
        try {
          const v = await axiosInstance.get('/vocabulary?limit=1');
          setHasNoWords(!v.data.words?.length);
        } catch { setHasNoWords(true); }
      } else {
        setHasNoWords(false);
      }
    } catch { toast.error('Failed to load reviews'); }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await Promise.all([fetchSession(), fetchDue()]);
      setIsLoading(false);
    })();
  }, [fetchSession, fetchDue]);

  const submitRating = async (quality) => {
    const card = reviews[idx];
    if (!card || submitting) return;
    setSubmitting(true);
    try {
      const r = await axiosInstance.post(`/vocabulary/review-limited/${card._id}`, { quality });
      if (r.data.session) {
        setSession(prev => ({ ...prev, ...r.data.session }));
        setDoneToday(r.data.session.isDoneForToday);
      }
      quality >= 3
        ? toast.success(r.data.message || 'Nice!', { duration: 1200 })
        : toast(r.data.message || 'Keep going!', { icon: '💪', duration: 1200 });

      if (idx < reviews.length - 1 && !r.data.session?.isDoneForToday) {
        setIdx(i => i + 1);
        setFlipped(false);
      } else {
        setTimeout(() => { fetchSession(); fetchDue(); }, 1200);
      }
    } catch (e) {
      if (e.response?.status === 429) { setDoneToday(true); fetchSession(); fetchDue(); }
      else toast.error('Failed to submit');
    } finally { setSubmitting(false); }
  };

  const card = reviews[idx];
  const pct = session ? Math.round((session.reviewsCompleted / session.maxReviews) * 100) : 0;

  if (isLoading) return (
    <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
  );

  if (hasNoWords) return (
    <div className="max-w-md mx-auto text-center py-16 space-y-6">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <BookOpen className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-2xl font-bold">No words to review yet</h2>
      <p className="text-base-content/60">Add words in the <strong>My Words</strong> tab, or get a starter set below.</p>
      <button className="btn btn-primary btn-lg" onClick={async () => {
        setIsSeeding(true);
        try {
          await axiosInstance.post('/vocabulary/seed-starter');
          toast.success('Starter words added!');
          setHasNoWords(false);
          await fetchDue(); await fetchSession();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
        finally { setIsSeeding(false); }
      }} disabled={isSeeding}>
        {isSeeding ? <Loader2 className="w-5 h-5 animate-spin" /> : '✨ Get Starter Words'}
      </button>
    </div>
  );

  if (doneToday || reviews.length === 0) return (
    <div className="max-w-md mx-auto text-center py-12 space-y-6">
      <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto">
        <PartyPopper className="w-12 h-12 text-success" />
      </div>
      <h2 className="text-2xl font-bold">All done for today! 🎉</h2>
      <p className="text-base-content/60">You've completed today's vocabulary practice. Come back tomorrow!</p>
      {session && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Reviewed', value: session.reviewsCompleted, icon: Brain, color: 'text-primary' },
            { label: 'Accuracy', value: `${session.accuracy || 0}%`, icon: Star, color: 'text-warning' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-base-200 rounded-2xl p-4 text-center">
              <Icon className={`w-6 h-6 ${color} mx-auto mb-1`} />
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-base-content/50">{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-base-content/50">
          <span>{idx + 1} / {reviews.length} cards</span>
          <span>{session?.reviewsCompleted || 0} reviewed today · {session?.accuracy || 0}% accuracy</span>
        </div>
        <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${((idx) / reviews.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 3D Flashcard */}
      <style>{FLIP_STYLE}</style>
      <div className="flashcard-scene w-full" style={{ height: 320 }}>
        <div className={`flashcard w-full h-full cursor-pointer ${flipped ? 'flipped' : ''}`}
          onClick={() => !submitting && setFlipped(f => !f)}>

          {/* Front — word */}
          <div className="flashcard-face absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-base-100 to-secondary/10 border border-base-300 shadow-xl flex flex-col items-center justify-center p-8 select-none">
            <div className="badge badge-ghost badge-sm mb-4 capitalize">{card?.category || 'general'}</div>
            <p className="text-5xl font-bold text-center tracking-tight mb-3">{card?.word}</p>
            {card?.pronunciation && (
              <p className="text-base-content/50 text-lg">/{card.pronunciation}/</p>
            )}
            <p className="text-base-content/30 text-sm mt-8">tap to reveal translation</p>
          </div>

          {/* Back — translation */}
          <div className="flashcard-face flashcard-back absolute inset-0 rounded-3xl bg-gradient-to-br from-secondary/20 via-base-100 to-primary/10 border border-base-300 shadow-xl flex flex-col items-center justify-center p-8 select-none">
            <p className="text-4xl font-bold text-primary text-center mb-4">{card?.translation}</p>
            {card?.exampleSentence && (
              <div className="bg-base-200 rounded-2xl px-5 py-3 text-center max-w-sm">
                <p className="text-sm italic text-base-content/70">"{card.exampleSentence}"</p>
              </div>
            )}
            <p className="text-base-content/30 text-sm mt-6">how well did you know this?</p>
          </div>
        </div>
      </div>

      {/* Rating buttons — only after flip */}
      <div className={`transition-all duration-300 ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {RATINGS.map(r => (
            <button
              key={r.value}
              disabled={submitting}
              onClick={() => submitRating(r.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 ${r.bg} ${r.border} hover:scale-105 transition-all active:scale-95 disabled:opacity-50`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className={`text-xs font-semibold ${r.text}`}>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nav arrows (before flip) */}
      {!flipped && (
        <div className="flex justify-between">
          <button className="btn btn-ghost btn-sm gap-1" onClick={() => { setIdx(i => Math.max(0, i - 1)); setFlipped(false); }} disabled={idx === 0}>
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button className="btn btn-ghost btn-sm gap-1" onClick={() => { setIdx(i => Math.min(reviews.length - 1, i + 1)); setFlipped(false); }} disabled={idx === reviews.length - 1}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── My Words ─────────────────────────────────────────────────────────────────
const MyWordsTab = () => {
  const { authUser } = useAuthUser();
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ word: '', translation: '', pronunciation: '', exampleSentence: '' });
  const [isAdding, setIsAdding] = useState(false);
  const wordInputRef = useRef(null);

  const fetchWords = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await axiosInstance.get('/vocabulary', { params: { limit: 200, sortBy: 'createdAt', order: 'desc' } });
      setWords(r.data.words || []);
    } catch { toast.error('Failed to load vocabulary'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchWords(); }, [fetchWords]);
  useEffect(() => { if (showForm) setTimeout(() => wordInputRef.current?.focus(), 50); }, [showForm]);

  const handleAdd = async () => {
    if (!form.word.trim() || !form.translation.trim()) return;
    setIsAdding(true);
    try {
      await axiosInstance.post('/vocabulary', {
        word: form.word.trim(),
        translation: form.translation.trim(),
        pronunciation: form.pronunciation.trim(),
        exampleSentence: form.exampleSentence.trim(),
        sourceLanguage: authUser?.nativeLanguage || 'english',
        targetLanguage: authUser?.learningLanguage || 'english',
        source: 'user',
      });
      toast.success('Word added!');
      setForm({ word: '', translation: '', pronunciation: '', exampleSentence: '' });
      setShowForm(false);
      fetchWords();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to add word'); }
    finally { setIsAdding(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/vocabulary/${id}`);
      setWords(p => p.filter(w => w._id !== id));
      toast.success('Removed');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = words.filter(w =>
    w.word.toLowerCase().includes(search.toLowerCase()) ||
    w.translation.toLowerCase().includes(search.toLowerCase())
  );

  const masteredCount = words.filter(w => w.isMastered).length;
  const dueCount = words.filter(w => new Date(w.nextReviewDate) <= new Date()).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Stats */}
      {words.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Words', value: words.length,    icon: BookOpen,    color: 'text-primary' },
            { label: 'Mastered',    value: masteredCount,    icon: CheckCircle2, color: 'text-success' },
            { label: 'Due Now',     value: dueCount,         icon: Clock,        color: 'text-warning' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-base-200 rounded-2xl p-4 text-center">
              <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-base-content/50">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input type="text" className="input input-bordered w-full pl-10 input-sm" placeholder="Search words..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm gap-1.5" onClick={() => setShowForm(v => !v)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Word'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card bg-base-200 border border-primary/20 shadow-lg">
          <div className="card-body p-5 space-y-3">
            <h3 className="font-bold text-base">New Vocabulary Word</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-base-content/50 mb-1 block">
                  Word in <span className="capitalize font-medium text-primary">{authUser?.learningLanguage || 'target language'}</span> *
                </label>
                <input ref={wordInputRef} className="input input-bordered input-sm w-full" placeholder="e.g. hola"
                  value={form.word} onChange={e => setForm(p => ({ ...p, word: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              </div>
              <div>
                <label className="text-xs text-base-content/50 mb-1 block">
                  Translation in <span className="capitalize font-medium text-secondary">{authUser?.nativeLanguage || 'your language'}</span> *
                </label>
                <input className="input input-bordered input-sm w-full" placeholder="e.g. hello"
                  value={form.translation} onChange={e => setForm(p => ({ ...p, translation: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              </div>
              <div>
                <label className="text-xs text-base-content/50 mb-1 block">Pronunciation (optional)</label>
                <input className="input input-bordered input-sm w-full" placeholder="/oh-lah/"
                  value={form.pronunciation} onChange={e => setForm(p => ({ ...p, pronunciation: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-base-content/50 mb-1 block">Example sentence (optional)</label>
                <input className="input input-bordered input-sm w-full" placeholder="e.g. Hola, ¿cómo estás?"
                  value={form.exampleSentence} onChange={e => setForm(p => ({ ...p, exampleSentence: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm gap-1.5" onClick={handleAdd}
                disabled={isAdding || !form.word.trim() || !form.translation.trim()}>
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Word
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Word List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 text-base-content/20" />
          </div>
          <p className="font-semibold">{search ? 'No matching words' : 'No words yet'}</p>
          <p className="text-sm text-base-content/50">
            {search ? 'Try a different search' : 'Add your first word to start building your vocabulary deck'}
          </p>
          {!search && (
            <button className="btn btn-primary btn-sm mt-2" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add First Word
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-base-content/40 px-1">
            {filtered.length} word{filtered.length !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </p>
          {filtered.map(w => {
            const isDue = new Date(w.nextReviewDate) <= new Date();
            return (
              <div key={w._id}
                className="group flex items-center gap-4 bg-base-100 border border-base-200 rounded-2xl px-5 py-3.5 hover:border-primary/30 hover:shadow-sm transition-all">
                {/* Mastery dot */}
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${w.isMastered ? 'bg-success' : isDue ? 'bg-warning animate-pulse' : 'bg-base-300'}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-bold text-base">{w.word}</span>
                    {w.pronunciation && <span className="text-xs text-base-content/40">/{w.pronunciation}/</span>}
                  </div>
                  <p className="text-sm text-primary font-medium">{w.translation}</p>
                  {w.exampleSentence && (
                    <p className="text-xs text-base-content/40 italic truncate mt-0.5">"{w.exampleSentence}"</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  {w.isMastered ? (
                    <span className="badge badge-success badge-xs">Mastered</span>
                  ) : isDue ? (
                    <span className="badge badge-warning badge-xs">Due</span>
                  ) : (
                    <span className="badge badge-ghost badge-xs">{w.repetitions || 0} reps</span>
                  )}
                  <button
                    className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-circle text-error transition-opacity"
                    onClick={() => handleDelete(w._id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const VocabularyReviewPage = () => {
  const [tab, setTab] = useState('review');

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2.5 bg-primary/15 rounded-2xl">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            Vocabulary
          </h1>
          <p className="text-base-content/50 mt-1">Spaced repetition flashcards — learn a little every day</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-base-200 p-1 rounded-xl w-fit mb-8">
          {[
            { id: 'review', label: 'Flashcard Review', icon: Brain },
            { id: 'words',  label: 'My Words',         icon: BookOpen },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id ? 'bg-base-100 shadow text-primary' : 'text-base-content/60 hover:text-base-content'
              }`}
              onClick={() => setTab(id)}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {tab === 'review' ? <ReviewTab /> : <MyWordsTab />}
      </div>
    </div>
  );
};

export default VocabularyReviewPage;
