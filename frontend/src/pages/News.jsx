import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllNews } from "../api/newsApi";
import { getErrorMessage } from "../api/api";
import { formatRelativeTime, normalizeArticle } from "../utils/article";
import NewsCard from "../components/NewsCard";
import Loader from "../components/Loader";

function sortByNewest(list) {
  return [...list].sort((a, b) => {
    const aTime = new Date(a.published_at || 0).getTime();
    const bTime = new Date(b.published_at || 0).getTime();
    return bTime - aTime;
  });
}

function buildTopicStats(list) {
  const counts = new Map();
  list.forEach((article) => {
    (article.keywords || []).forEach((word) => {
      const key = String(word || "").trim();
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([label, count]) => ({ label, count }));
}

export default function News() {
  const [news, setNews] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAllNews(search);
        setNews(
          sortByNewest((Array.isArray(data) ? data : []).map(normalizeArticle))
        );
      } catch (err) {
        setNews([]);
        setError(getErrorMessage(err, "Failed to load AI news"));
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [search]);

  const topics = useMemo(() => buildTopicStats(news), [news]);
  const lead = news[0] || null;
  const side = news.slice(1, 5);

  const applyTopic = (topic) => {
    setKeyword((prev) => (prev.toLowerCase() === topic.toLowerCase() ? "" : topic));
  };

  return (
    <div className="page newsroom-page">
      <header className="newsroom-top">
        <div className="newsroom-top-inner">
          <div className="newsroom-brand-block">
            <p className="newsroom-label">Coverage</p>
            <h1>AI News</h1>
          </div>

          <div className="newsroom-top-tools">
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search hub briefs..."
              className="newsroom-search"
            />
            <Link to="/articles" className="btn-primary">
              AI Articles
            </Link>
            <Link to="/community" className="btn-secondary">
              Community
            </Link>
          </div>
        </div>
      </header>

      <div className="newsroom-body">
        <section className="newsroom-panel">
          <div className="newsroom-panel-head">
            <h2>Generated news desk</h2>
            <span>{news.length} headlines</span>
          </div>

          {loading && news.length === 0 ? <Loader label="Loading generated news..." /> : null}

          {lead ? (
            <div className="live-board">
              <Link className="live-feature" to={`/articles/${lead._id}`}>
                <div className="story-meta">
                  <span className="badge live-badge">Generated</span>
                  <span className="meta-text">{formatRelativeTime(lead.published_at)}</span>
                </div>
                <h3>{lead.title}</h3>
                <p>{lead.summary || "Generated AI news brief."}</p>
                <span className="text-link">Read full brief →</span>
              </Link>

              <div className="live-side-list">
                {side.map((item) => (
                  <Link
                    key={item._id}
                    className="live-side-item"
                    to={`/articles/${item._id}`}
                  >
                    <span className="meta-text">{formatRelativeTime(item.published_at)}</span>
                    <strong>{item.title}</strong>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="newsroom-panel">
          <div className="newsroom-panel-head">
            <h2>Hub briefs</h2>
            <span>{news.length} generated</span>
          </div>

          {topics.length > 0 ? (
            <div className="topic-chip-row newsroom-topics">
              {topics.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  className={`topic-chip ${
                    search.toLowerCase() === topic.label.toLowerCase() ? "active" : ""
                  }`}
                  onClick={() => applyTopic(topic.label)}
                >
                  #{topic.label}
                  <span>{topic.count}</span>
                </button>
              ))}
              {search ? (
                <button type="button" className="topic-chip clear" onClick={() => setKeyword("")}>
                  Clear
                </button>
              ) : null}
            </div>
          ) : null}

          {error ? <div className="alert alert-error">{error}</div> : null}
          {loading ? <Loader label="Loading hub briefs..." /> : null}

          {!loading && news.length === 0 ? (
            <div className="empty-state">
              <h2>No hub briefs yet</h2>
              <p>
                {search
                  ? `Nothing matched “${search}”.`
                  : "Generated AI News briefs will appear here as a clean reading list."}
              </p>
            </div>
          ) : null}

          {!loading && news.length > 0 ? (
            <div className="hub-feed">
              {news.map((article) => (
                <NewsCard
                  key={article._id}
                  article={article}
                  onTopicClick={applyTopic}
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
