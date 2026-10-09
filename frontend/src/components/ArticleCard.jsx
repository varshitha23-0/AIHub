import { Link } from "react-router-dom";
import { formatRelativeTime, normalizeArticle } from "../utils/article";

export default function ArticleCard({ article, onTopicClick, index }) {
  const item = normalizeArticle(article);
  const label = index ? String(index).padStart(2, "0") : null;
  const isLive = Boolean(item.live && item.href);

  return (
    <article className="essay-card">
      {label ? <span className="essay-card-index">{label}</span> : null}
      <div className="essay-card-body">
        <div className="story-meta">
          <span className="badge">{isLive ? "Live" : "Essay"}</span>
          {item.source ? <span className="meta-text">{item.source}</span> : null}
          <span className="meta-text">{formatRelativeTime(item.published_at)}</span>
          {!isLive ? (
            <span className="meta-text">
              {item.source_count || item.sources?.length || 1} sources
            </span>
          ) : null}
        </div>

        <h3>{item.title}</h3>
        <p>{item.summary || "No summary available."}</p>

        {item.source_articles?.length ? (
          <div className="source-article-preview">
            <span className="source-article-label">Source articles</span>
            {item.source_articles.slice(0, 2).map((sourceArticle, sourceIndex) => (
              <a
                key={`${sourceArticle.url || sourceArticle.title}-${sourceIndex}`}
                href={sourceArticle.url || undefined}
                target={sourceArticle.url ? "_blank" : undefined}
                rel={sourceArticle.url ? "noopener noreferrer" : undefined}
                className="source-article-link"
              >
                {sourceArticle.title || "Untitled source article"}
              </a>
            ))}
            {item.source_articles.length > 2 ? (
              <span className="meta-text">+{item.source_articles.length - 2} more</span>
            ) : null}
          </div>
        ) : null}

        {item.keywords?.length ? (
          <div className="tag-row">
            {item.keywords.slice(0, 3).map((word) =>
              onTopicClick ? (
                <button
                  key={word}
                  type="button"
                  className="tag topic-tag-btn"
                  onClick={() => onTopicClick(word)}
                >
                  #{word}
                </button>
              ) : (
                <span key={word} className="tag">
                  #{word}
                </span>
              )
            )}
          </div>
        ) : null}

        {isLive ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            Read on {item.source || "source"} →
          </a>
        ) : (
          <Link to={`/articles/${item._id}`} className="text-link">
            Read essay →
          </Link>
        )}
      </div>
    </article>
  );
}
