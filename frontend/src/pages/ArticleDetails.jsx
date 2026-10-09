import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNewsById } from "../api/newsApi";
import { getErrorMessage } from "../api/api";
import { formatDate, formatSource, normalizeArticle } from "../utils/article";
import Loader from "../components/Loader";

export default function ArticleDetails() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getNewsById(id);

        if (!data || data.message === "Article not found" || !data._id) {
          setArticle(null);
          setError("Article not found");
          return;
        }

        setArticle(normalizeArticle(data));
      } catch (err) {
        setArticle(null);
        setError(getErrorMessage(err, "Failed to load article"));
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <Loader label="Loading article..." />;

  if (error || !article) {
    return (
      <div className="page solution-page">
        <section className="solution-band soft">
          <div className="solution-band-inner">
            <Link to="/articles" className="text-link">
              ← Back to articles
            </Link>
            <div className="empty-state">
              <h2>Article unavailable</h2>
              <p>{error || "This article could not be loaded."}</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page solution-page">
      <section className="solution-hero articles">
        <div className="solution-hero-inner">
          <p className="solution-kicker">Generated article</p>
          <h1>{article.title}</h1>
          <p className="solution-lead">{formatDate(article.published_at)}</p>
          <div className="solution-actions">
            <Link to="/articles" className="solution-btn ghost">
              ← Back to articles
            </Link>
          </div>
        </div>
      </section>

      <section className="solution-band soft">
        <div className="solution-band-inner">
          {article.summary ? (
            <div className="summary-box">
              <h2>Summary</h2>
              <p>{article.summary}</p>
            </div>
          ) : null}

          <div className="article-body">
            {article.content || "No article content available."}
          </div>

          {article.keywords?.length ? (
            <div className="section-block">
              <h3>Keywords</h3>
              <div className="tag-row">
                {article.keywords.map((keyword) => (
                  <span key={keyword} className="tag">
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="section-block">
            <h3>Source articles ({article.source_count || article.sources.length})</h3>
            {article.source_articles.length === 0 ? (
              <div className="tag-row">
                {article.sources.length === 0 ? (
                  <p className="meta-text">No sources listed.</p>
                ) : (
                  article.sources.map((source, index) => (
                    <span key={`${formatSource(source)}-${index}`} className="source-chip">
                      {formatSource(source)}
                    </span>
                  ))
                )}
              </div>
            ) : (
              <div className="source-article-list">
                {article.source_articles.map((sourceArticle, index) => (
                  <article
                    key={`${sourceArticle.url || sourceArticle.title}-${index}`}
                    className="source-article"
                  >
                    <div className="source-article-meta">
                      <span className="badge">{formatSource(sourceArticle.source)}</span>
                      {sourceArticle.published_at ? (
                        <span className="meta-text">{formatDate(sourceArticle.published_at)}</span>
                      ) : null}
                    </div>
                    <h4>{sourceArticle.title || "Untitled source article"}</h4>
                    {sourceArticle.description ? <p>{sourceArticle.description}</p> : null}
                    {sourceArticle.url ? (
                      <a
                        href={sourceArticle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link"
                      >
                        Read original article →
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
