import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  BookOpen,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Send,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import { getWordOfDay, submitWordOfDaySentence, getEnglishWordOfDay } from "../lib/learningApi";

const WordOfDayPage = () => {
  const queryClient = useQueryClient();
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["wordOfDay"],
    queryFn: getWordOfDay,
  });

  const { data: englishWOTD } = useQuery({
    queryKey: ["englishWordOfDay"],
    queryFn: getEnglishWordOfDay,
    staleTime: 1000 * 60 * 60,
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => submitWordOfDaySentence(sentence, data?.word?._id),
    onSuccess: (res) => {
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ["wordOfDay"] });
      if (res.passed) {
        toast.success(`+${res.xpAwarded} XP earned!`);
      }
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Something went wrong";
      if (err?.response?.status === 409) {
        // Already completed — reload data
        queryClient.invalidateQueries({ queryKey: ["wordOfDay"] });
      }
      toast.error(msg);
    },
  });

  const word = data?.word;
  const alreadyCompleted = data?.alreadyCompleted;
  const prevCompletion = data?.completion;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!word) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center mt-16">
        <BookOpen className="size-12 mx-auto mb-4 opacity-30" />
        <p className="text-base-content/60">No word available today. Check back later.</p>
        <Link to="/" className="btn btn-ghost mt-4">Back to Home</Link>
      </div>
    );
  }

  // Show already-completed state
  const showCompleted = alreadyCompleted && !result;
  const showResult = !!result;
  const showForm = !alreadyCompleted && !result;

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-base-100">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="btn btn-ghost btn-sm btn-circle">
            <ChevronLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Word of the Day</h1>
            <p className="text-sm text-base-content/60">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Merriam-Webster English Word of the Day */}
        {englishWOTD?.word?.word && (
          <div className="card bg-gradient-to-r from-secondary/15 to-accent/10 border border-secondary/30 mb-6">
            <div className="card-body p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="size-4 text-secondary" />
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Today's English Word · Merriam-Webster</span>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl font-bold text-secondary">{englishWOTD.word.word}</span>
                {englishWOTD.word.pronunciation && (
                  <span className="text-sm text-base-content/50 font-mono">/{englishWOTD.word.pronunciation}/</span>
                )}
                {englishWOTD.word.partOfSpeech && (
                  <span className="badge badge-ghost badge-sm italic">{englishWOTD.word.partOfSpeech}</span>
                )}
              </div>
              {englishWOTD.word.definition && (
                <p className="text-sm text-base-content/70 mt-2 leading-relaxed">{englishWOTD.word.definition}</p>
              )}
              {englishWOTD.word.example && (
                <p className="text-xs text-base-content/50 mt-2 italic">"{englishWOTD.word.example}"</p>
              )}
            </div>
          </div>
        )}

        {/* Word Card — Language Practice */}
        <div className="card bg-gradient-to-br from-primary/15 to-secondary/15 border border-primary/20 mb-6">
          <div className="card-body p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-4xl font-bold tracking-tight">{word.word}</p>
                {word.pronunciation && (
                  <p className="text-base-content/50 text-sm mt-1">/{word.pronunciation}/</p>
                )}
              </div>
              <span className="badge badge-primary badge-outline capitalize">{word.category}</span>
            </div>

            <p className="text-lg font-medium text-primary mt-2">{word.translation}</p>

            {word.context && (
              <p className="text-sm text-base-content/70 mt-1">{word.context}</p>
            )}

            {word.exampleSentence?.original && (
              <div className="mt-4 bg-base-100/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1">Example</p>
                <p className="text-sm italic">"{word.exampleSentence.original}"</p>
                {word.exampleSentence.translated && (
                  <p className="text-xs text-base-content/50 mt-1">"{word.exampleSentence.translated}"</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* XP badge */}
        <div className="flex items-center gap-2 mb-3">
          <Star className="size-4 text-yellow-500" />
          <span className="text-sm font-medium">Practice challenge — earn <span className="text-yellow-500 font-bold">+20 XP</span></span>
        </div>

        {/* Sentence form */}
        {showForm && (
          <div className="card bg-base-200 mb-6">
            <div className="card-body p-5">
              <h3 className="font-semibold mb-3">Use "{word.word}" in a sentence</h3>
              <textarea
                className="textarea textarea-bordered w-full resize-none text-base"
                rows={3}
                placeholder={`Write a sentence using "${word.word}"…`}
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                disabled={isPending}
              />
              <button
                className="btn btn-primary mt-3 w-full gap-2"
                onClick={() => submit()}
                disabled={isPending || !sentence.trim()}
              >
                {isPending ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <Send className="size-4" />
                )}
                {isPending ? "Checking…" : "Submit"}
              </button>
            </div>
          </div>
        )}

        {/* Result after submission */}
        {showResult && (
          <FeedbackCard result={result} word={word.word} />
        )}

        {/* Already completed earlier today */}
        {showCompleted && prevCompletion && (
          <div className="card bg-base-200 mb-6">
            <div className="card-body p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="size-5 text-success" />
                <h3 className="font-semibold">Completed today</h3>
                {prevCompletion.xpAwarded > 0 && (
                  <span className="badge badge-warning badge-sm ml-auto">+{prevCompletion.xpAwarded} XP</span>
                )}
              </div>
              <div className="bg-base-100 rounded-xl p-4 mb-3">
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1">Your sentence</p>
                <p className="text-sm italic">"{prevCompletion.userSentence}"</p>
              </div>
              {prevCompletion.aiFeedback?.feedback && (
                <p className="text-sm text-base-content/70">{prevCompletion.aiFeedback.feedback}</p>
              )}
              {prevCompletion.aiFeedback?.correction && (
                <div className="mt-3 bg-info/10 rounded-xl p-3">
                  <p className="text-xs font-semibold text-info mb-1">Suggestion</p>
                  <p className="text-sm">"{prevCompletion.aiFeedback.correction}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        <Link to="/" className="btn btn-ghost w-full">Back to Home</Link>
      </div>
    </div>
  );
};

const FeedbackCard = ({ result, word }) => {
  const { aiFeedback, xpAwarded, passed, leveledUp, newLevel } = result;

  return (
    <div className={`card mb-6 ${passed ? "bg-success/10 border border-success/30" : "bg-warning/10 border border-warning/30"}`}>
      <div className="card-body p-5">
        <div className="flex items-center gap-2 mb-3">
          {passed ? (
            <CheckCircle2 className="size-6 text-success" />
          ) : (
            <XCircle className="size-6 text-warning" />
          )}
          <h3 className="font-bold text-lg">
            {passed ? "Great job!" : "Almost there!"}
          </h3>
          {xpAwarded > 0 && (
            <span className="badge badge-warning ml-auto">+{xpAwarded} XP</span>
          )}
        </div>

        {leveledUp && (
          <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2 mb-3">
            <Sparkles className="size-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Level up! You reached level {newLevel}!</span>
          </div>
        )}

        {aiFeedback?.feedback && (
          <p className="text-sm text-base-content/80 mb-3">{aiFeedback.feedback}</p>
        )}

        {aiFeedback?.correction && (
          <div className="bg-base-100/60 rounded-xl p-3">
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1">
              {passed ? "You could also say" : "Suggested correction"}
            </p>
            <p className="text-sm italic">"{aiFeedback.correction}"</p>
          </div>
        )}

        {aiFeedback?.score != null && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-base-content/50 mb-1">
              <span>Score</span>
              <span>{aiFeedback.score}/100</span>
            </div>
            <progress
              className={`progress w-full ${passed ? "progress-success" : "progress-warning"}`}
              value={aiFeedback.score}
              max="100"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WordOfDayPage;
