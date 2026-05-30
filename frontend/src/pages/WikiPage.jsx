import { useState, useCallback } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookMarked, Search, Plus, X, Globe, FileText, Loader, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { getWikiArticles, ingestWikiContent, getWikiRawStatus } from "../lib/wikiApi";
import toast from "react-hot-toast";

const TYPE_TABS = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "language_term", label: "Language" },
  { value: "vocabulary", label: "Vocabulary" },
];

const TYPE_BADGE = {
  general: "badge-primary",
  language_term: "badge-secondary",
  vocabulary: "badge-accent",
};

function useDebounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function IngestModal({ onClose }) {
  const [source, setSource] = useState("manual");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [pendingRawId, setPendingRawId] = useState(null);

  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ["wikiStatus", pendingRawId],
    queryFn: () => getWikiRawStatus(pendingRawId),
    enabled: !!pendingRawId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || ["pending", "processing"].includes(status)) return 3000;
      return false;
    },
  });

  const mutation = useMutation({
    mutationFn: ingestWikiContent,
    onSuccess: (data) => {
      setPendingRawId(data.rawId);
      setContent("");
      setUrl("");
    },
    onError: () => toast.error("Failed to submit content"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (source === "web" && !url.trim()) return toast.error("Enter a URL");
    if (source !== "web" && !content.trim()) return toast.error("Enter some content");
    mutation.mutate({ source, content: source !== "web" ? content : undefined, url: source === "web" ? url : undefined });
  };

  const isDone = statusData && !["pending", "processing"].includes(statusData.status);
  const isProcessing = statusData && ["pending", "processing"].includes(statusData.status);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Plus className="size-5 text-primary" /> Add to Wiki
          </h2>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {pendingRawId ? (
            <div className="space-y-4">
              {isProcessing && (
                <div className="alert alert-info">
                  <Loader className="size-5 animate-spin" />
                  <span>Processing your content — this takes a few seconds...</span>
                </div>
              )}
              {statusData?.status === "processed" && (
                <div className="alert alert-success">
                  <CheckCircle className="size-5" />
                  <div>
                    <p className="font-semibold">Article created!</p>
                    {statusData.articleId && (
                      <Link
                        to={`/wiki`}
                        className="link text-sm"
                        onClick={onClose}
                      >
                        Browse the wiki to find it
                      </Link>
                    )}
                  </div>
                </div>
              )}
              {statusData?.status === "failed" && (
                <div className="alert alert-error">
                  <AlertCircle className="size-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Processing failed</p>
                    <p className="text-xs opacity-80 mt-0.5">{statusData.error}</p>
                    {statusData.error?.includes("OPENAI_API_KEY") && (
                      <p className="text-xs mt-2 opacity-70">
                        Add <code className="bg-error-content/10 px-1 rounded">OPENAI_API_KEY=sk-...</code> to{" "}
                        <code className="bg-error-content/10 px-1 rounded">backend/.env</code> and restart the server.
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost btn-sm gap-1"
                  onClick={() => { setPendingRawId(null); }}
                >
                  <Plus className="size-4" /> Submit another
                </button>
                {statusData?.status === "failed" && (
                  <button className="btn btn-outline btn-sm gap-1" onClick={() => refetchStatus()}>
                    <RefreshCw className="size-4" /> Retry
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Source type</span></label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: "web", label: "Web URL", icon: Globe },
                    { value: "manual", label: "Text", icon: FileText },
                    { value: "vocabulary", label: "Vocabulary", icon: BookMarked },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      className={`btn btn-sm gap-1 ${source === value ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setSource(value)}
                    >
                      <Icon className="size-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {source === "web" ? (
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">URL</span></label>
                  <input
                    type="url"
                    className="input input-bordered"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Content</span></label>
                  <textarea
                    className="textarea textarea-bordered h-32 resize-none"
                    placeholder={
                      source === "vocabulary"
                        ? "Paste a word, definition, etymology, examples..."
                        : "Paste any text, article excerpt, or knowledge you want to add to the wiki..."
                    }
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full gap-2"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <Loader className="size-4 animate-spin" /> : <Plus className="size-4" />}
                {mutation.isPending ? "Submitting..." : "Add to Wiki"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article }) {
  return (
    <Link to={`/wiki/${article.slug}`} className="card bg-base-200 hover:bg-base-300 transition-colors border border-base-300 hover:border-primary/30">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base leading-tight line-clamp-2">{article.title}</h3>
          <span className={`badge badge-sm shrink-0 ${TYPE_BADGE[article.type] || "badge-ghost"}`}>
            {article.type?.replace("_", " ")}
          </span>
        </div>
        {article.summary && (
          <p className="text-sm text-base-content/60 line-clamp-2 mt-1">{article.summary}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-wrap gap-1">
            {article.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="badge badge-ghost badge-xs">{tag}</span>
            ))}
          </div>
          <span className="text-xs text-base-content/40">
            {article.sources?.length || 0} source{article.sources?.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}

const WikiPage = () => {
  const [activeType, setActiveType] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const debouncedSetSearch = useCallback(
    (() => {
      let t;
      return (val) => {
        clearTimeout(t);
        t = setTimeout(() => { setSearchQuery(val); setPage(1); }, 400);
      };
    })(),
    []
  );

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wikiArticles", activeType, searchQuery, page],
    queryFn: () => getWikiArticles({ type: activeType, q: searchQuery || undefined, page }),
    keepPreviousData: true,
  });

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookMarked className="size-6 text-primary" /> LLM Wiki
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Knowledge compiled from every source — growing smarter over time
          </p>
        </div>
        <button className="btn btn-primary gap-2" onClick={() => setShowModal(true)}>
          <Plus className="size-4" /> Add Source
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
        <input
          type="text"
          className="input input-bordered w-full pl-9"
          placeholder="Search the wiki..."
          value={searchInput}
          onChange={handleSearchChange}
        />
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`btn btn-sm ${activeType === tab.value ? "btn-primary" : "btn-ghost"}`}
            onClick={() => { setActiveType(tab.value); setPage(1); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card bg-base-200 border border-base-300 animate-pulse">
              <div className="card-body p-4 space-y-3">
                <div className="h-5 bg-base-300 rounded w-3/4" />
                <div className="h-3 bg-base-300 rounded w-full" />
                <div className="h-3 bg-base-300 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="alert alert-error">
          <AlertCircle className="size-5" />
          <span>Failed to load wiki articles.</span>
        </div>
      ) : data?.articles?.length === 0 ? (
        <div className="text-center py-16 text-base-content/40">
          <BookMarked className="size-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No articles yet</p>
          <p className="text-sm mt-1">Add the first source to get started</p>
          <button className="btn btn-primary btn-sm mt-4 gap-2" onClick={() => setShowModal(true)}>
            <Plus className="size-4" /> Add Source
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>

          {data.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                className="btn btn-sm btn-ghost"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="flex items-center text-sm text-base-content/60">
                {page} / {data.pages}
              </span>
              <button
                className="btn btn-sm btn-ghost"
                disabled={page === data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showModal && <IngestModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default WikiPage;
