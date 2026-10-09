function cleanText(value = "") {
  return String(value)
    .replace(/<\/?n>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeArticle(article = {}) {
  const rawTitle =
    article.topic ||
    article.title ||
    "";

  const rawContent =
    article.article ||
    article.content ||
    "";

  const summary = cleanText(article.summary || "");

  const title =
    cleanText(rawTitle) ||
    (summary ? `${summary.slice(0, 72)}${summary.length > 72 ? "…" : ""}` : "Untitled article");

  const content = cleanText(rawContent);

  const publishedAt =
    article.published_at ||
    article.generated_at ||
    null;

  const sources = Array.isArray(article.sources)
    ? article.sources
    : [];

  const sourceArticles = Array.isArray(article.source_articles)
    ? article.source_articles
    : [];

  const keywords = (Array.isArray(article.keywords) ? article.keywords : [])
    .map((item) => cleanText(item))
    .filter((item) => item && item.toLowerCase() !== "nan");

  return {
    ...article,
    title,
    topic: title,
    content,
    article: content,
    summary,
    keywords,
    sources,
    source_articles: sourceArticles,
    source_count: article.source_count ?? sources.length,
    published_at: publishedAt,
    generated_at: publishedAt,
  };
}

export function formatDate(value, fallback = "Recently") {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(value, fallback = "Just now") {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "Just now";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 45) return "Just now";
  if (seconds < 90) return "1 min ago";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatDate(value);
}

export function isFreshArticle(value, withinMinutes = 180) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() <= withinMinutes * 60 * 1000;
}

export function formatSource(source) {
  if (!source) return "Unknown source";
  if (typeof source === "string") return source;
  return source.name || source.title || source.url || "Source";
}

export function cleanKeywords(list = []) {
  return (Array.isArray(list) ? list : [])
    .map((item) => cleanText(item))
    .filter((item) => item && item.toLowerCase() !== "nan");
}
