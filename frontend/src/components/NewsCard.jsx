import { Link } from "react-router-dom";
import {
  formatRelativeTime,
  formatSource,
  normalizeArticle,
} from "../utils/article";

export default function NewsCard({ article, onTopicClick }) {
  const item = normalizeArticle(article);

  return (
    <article className="hub-row">
      <div className="hub-row-main">
        <div className="story-meta">
          <span className="badge">Hub</span>
          <span className="meta-text">{formatRelativeTime(item.published_at)}</span>
          <span className="meta-text">{item.source_count || 1} sources</span>
        </div>

        <h3>{item.title}</h3>
        <p>{item.summary || "No summary available."}</p>

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

        {item.sources?.[0] ? (
          <span className="meta-text">Lead: {formatSource(item.sources[0])}</span>
        ) : null}
      </div>

      <Link to={`/articles/${item._id}`} className="btn-secondary hub-row-cta">
        Read
      </Link>
    </article>
  );
}
