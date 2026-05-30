import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookMarked, Eye, AlertTriangle, ExternalLink, Globe, FileText, Tag } from "lucide-react";
import { getWikiArticle } from "../lib/wikiApi";

const TYPE_BADGE = {
  general: "badge-primary",
  language_term: "badge-secondary",
  vocabulary: "badge-accent",
};

// Minimal markdown → JSX renderer (handles what the AI generates)
function renderBody(body) {
  if (!body) return null;
  const lines = body.split("\n");
  const elements = [];
  let listItems = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1 text-base-content/80 mb-4 ml-2">
          {listItems.map((item, i) => <li key={i}>{applyInline(item)}</li>)}
        </ul>
      );
      listItems = [];
    }
  };

  const applyInline = (text) => {
    // bold
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(<h3 key={key++} className="text-lg font-semibold mt-5 mb-2">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(<h2 key={key++} className="text-xl font-bold mt-6 mb-2 border-b border-base-300 pb-1">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(<h1 key={key++} className="text-2xl font-bold mt-6 mb-3">{trimmed.slice(2)}</h1>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
    } else if (trimmed === "") {
      flushList();
    } else {
      flushList();
      elements.push(<p key={key++} className="text-base-content/80 leading-relaxed mb-3">{applyInline(trimmed)}</p>);
    }
  }
  flushList();
  return elements;
}

function SourceIcon({ source }) {
  if (source === "web") return <Globe className="size-3.5 text-info" />;
  return <FileText className="size-3.5 text-base-content/40" />;
}

const WikiArticlePage = () => {
  const { slug } = useParams();

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ["wikiArticle", slug],
    queryFn: () => getWikiArticle(slug),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 animate-pulse space-y-4">
        <div className="h-4 bg-base-300 rounded w-24" />
        <div className="h-8 bg-base-300 rounded w-3/4" />
        <div className="h-4 bg-base-300 rounded w-full" />
        <div className="h-4 bg-base-300 rounded w-5/6" />
        <div className="h-4 bg-base-300 rounded w-2/3" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Link to="/wiki" className="btn btn-ghost btn-sm gap-1 mb-4">
          <ArrowLeft className="size-4" /> Back to Wiki
        </Link>
        <div className="alert alert-error">
          <AlertTriangle className="size-5" />
          <span>Article not found or failed to load.</span>
        </div>
      </div>
    );
  }

  const unresolvedContradictions = article.contradictions?.filter((c) => !c.resolved) || [];

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Back */}
      <Link to="/wiki" className="btn btn-ghost btn-sm gap-1 mb-6">
        <ArrowLeft className="size-4" /> Wiki
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`badge ${TYPE_BADGE[article.type] || "badge-ghost"}`}>
            {article.type?.replace("_", " ")}
          </span>
          <span className="flex items-center gap-1 text-xs text-base-content/40">
            <Eye className="size-3" /> {article.viewCount} views
          </span>
          <span className="text-xs text-base-content/40">
            {article.sources?.length || 0} source{article.sources?.length !== 1 ? "s" : ""}
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-2">{article.title}</h1>

        {article.summary && (
          <p className="text-base-content/60 text-lg leading-relaxed">{article.summary}</p>
        )}

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Tag className="size-3.5 text-base-content/40 mt-0.5" />
            {article.tags.map((tag) => (
              <span key={tag} className="badge badge-ghost badge-sm">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Contradictions warning */}
      {unresolvedContradictions.length > 0 && (
        <div className="alert alert-warning mb-6">
          <AlertTriangle className="size-5 shrink-0" />
          <div>
            <p className="font-semibold">{unresolvedContradictions.length} unresolved contradiction{unresolvedContradictions.length > 1 ? "s" : ""} flagged</p>
            <ul className="text-sm mt-1 space-y-1">
              {unresolvedContradictions.map((c, i) => (
                <li key={i} className="opacity-80">
                  <span className="font-medium">"{c.claim}"</span> conflicts with{" "}
                  <span className="font-medium">"{c.conflictsWith}"</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="prose-custom mb-8">
        {renderBody(article.body)}
      </div>

      {/* Claims */}
      {article.claims?.length > 0 && (
        <div className="card bg-base-200 border border-base-300 mb-6">
          <div className="card-body p-4">
            <h2 className="font-bold text-sm uppercase tracking-wide text-base-content/50 mb-3">Key Facts</h2>
            <ul className="space-y-2">
              {article.claims.map((claim, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="shrink-0 mt-0.5 size-2 rounded-full bg-primary/60 inline-block" />
                  <span className="text-base-content/80">{claim.fact}</span>
                  <span className="shrink-0 text-xs text-base-content/30 ml-auto">
                    {Math.round((claim.confidence || 0.8) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Sources */}
      {article.sources?.length > 0 && (
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-4">
            <h2 className="font-bold text-sm uppercase tracking-wide text-base-content/50 mb-3">Sources</h2>
            <ul className="space-y-2">
              {article.sources.map((src, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <SourceIcon source={src.source} />
                  {src.url ? (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-hover text-info truncate max-w-xs"
                    >
                      {src.url}
                    </a>
                  ) : (
                    <span className="text-base-content/60">{src.title || src.source}</span>
                  )}
                  <ExternalLink className="size-3 text-base-content/30 shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default WikiArticlePage;
