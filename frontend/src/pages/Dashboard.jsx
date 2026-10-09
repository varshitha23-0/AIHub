import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllTools } from "../api/toolsApi";
import { getAllNews } from "../api/newsApi";
import { formatRelativeTime, normalizeArticle } from "../utils/article";
import Loader from "../components/Loader";

function hashSeed(value = "") {
  return String(value)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function seededTrend(seed, points = 16) {
  let value = 35 + (seed % 40);
  const series = [];
  const drift = (seed % 2 === 0 ? 1 : -1) * (0.4 + (seed % 5) * 0.12);
  for (let i = 0; i < points; i += 1) {
    const wave = Math.sin((i + seed) / 2.3) * 5;
    const noise = ((seed * (i + 3)) % 7) - 3;
    value = Math.max(8, value + drift + wave * 0.2 + noise * 0.3);
    series.push(Number(value.toFixed(2)));
  }
  return series;
}

function buildPath(values, width = 120, height = 40, pad = 4) {
  if (!values.length) return { line: "", area: "" };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const coords = values.map((value, index) => {
    const x = pad + (index / Math.max(values.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return [x, y];
  });
  const line = coords
    .map((point, index) => `${index === 0 ? "M" : "L"}${point[0]},${point[1]}`)
    .join(" ");
  const area = `${line} L${coords[coords.length - 1][0]},${height} L${coords[0][0]},${height} Z`;
  return { line, area };
}

function Sparkline({ values, up, id }) {
  const { line, area } = buildPath(values);
  const stroke = up ? "#22c55e" : "#ef4444";
  const fillId = `toolsSpark-${id}`;

  return (
    <svg className="tools-watch-spark" viewBox="0 0 120 40" aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="4" x2="116" y1="20" y2="20" className="tools-watch-baseline" />
      <path d={area} fill={`url(#${fillId})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function formatScore(tool, index) {
  const stars = Number(tool.stars) || 0;
  if (stars > 0) return stars.toLocaleString();
  return (92 - index * 3 - (hashSeed(tool._id) % 5)).toFixed(1);
}

export default function Dashboard() {
  const [stories, setStories] = useState([]);
  const [topTools, setTopTools] = useState([]);
  const [activeSection, setActiveSection] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [generated, toolsPrimary] = await Promise.all([
          getAllNews(),
          getAllTools("", "Ai And Machine Learning", 1, 8).catch(() => null),
        ]);
        if (cancelled) return;

        let toolsResponse = toolsPrimary;
        if (!toolsResponse?.data?.length) {
          toolsResponse = await getAllTools("", "", 1, 8).catch(() => null);
        }

        const generatedStories = (Array.isArray(generated) ? generated : [])
          .map(normalizeArticle)
          .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
        setStories(generatedStories);
        setTopTools(toolsResponse?.data || []);
        if (!generatedStories.length) setError("Generated news is unavailable right now.");
        else setError("");
      } catch {
        if (!cancelled) {
          setStories([]);
          setError("Could not load the front page.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const sections = useMemo(() => {
    const set = new Set(stories.map((s) => s.category).filter(Boolean));
    return ["All", ...[...set].sort((a, b) => a.localeCompare(b))];
  }, [stories]);

  const filtered = useMemo(() => {
    if (activeSection === "All") return stories;
    return stories.filter(
      (story) => (story.category || "").toLowerCase() === activeSection.toLowerCase()
    );
  }, [stories, activeSection]);

  const toolWatchlist = useMemo(
    () =>
      topTools.slice(0, 6).map((tool, index) => {
        const seed = hashSeed(tool._id || tool.tool_name || index);
        const series = seededTrend(seed);
        const first = series[0];
        const last = series[series.length - 1];
        const change = Number((((last - first) / Math.max(first, 1)) * 100).toFixed(2));
        const name = tool.tool_name || tool.name || "AI Tool";
        const symbol = name
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(0, 5)
          .toUpperCase() || "TOOL";

        return {
          id: tool._id,
          symbol,
          name,
          category: tool.category || tool.primary_task || "AI Tool",
          series,
          up: change >= 0,
          change,
          score: formatScore(tool, index),
        };
      }),
    [topTools]
  );

  const breakStory = filtered[0] || null;
  const leftCol = filtered.slice(1, 4);
  const midCol = filtered.slice(4, 7);
  const rightCol = filtered.slice(7, 14);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (loading) return <Loader label="Opening the front page..." />;

  return (
    <div className="page front-page">
      <header className="front-bar">
        <div className="front-bar-inner">
          <div className="front-bar-brand">
            <span className="front-paper">AI Hub</span>
            <span className="front-date">{today}</span>
          </div>
          <nav className="front-sections" aria-label="Sections">
            {sections.map((section) => (
              <button
                key={section}
                type="button"
                className={`front-section ${activeSection === section ? "active" : ""}`}
                onClick={() => setActiveSection(section)}
              >
                {section}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {error ? (
        <div className="front-shell">
          <div className="alert alert-error">{error}</div>
        </div>
      ) : null}

      {breakStory ? (
        <section className="front-break">
          <div className="front-break-grid">
            <a
              className="front-break-story"
              href={breakStory.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <p className="front-break-meta">
                <span>Breaking</span>
                <span>{breakStory.source}</span>
                <span>{formatRelativeTime(breakStory.published_at)}</span>
              </p>
              <h1>{breakStory.title}</h1>
              <p className="front-break-dek">{breakStory.summary}</p>
              <span className="front-break-cta">Continue reading</span>
            </a>

            {toolWatchlist.length > 0 ? (
              <div className="front-break-tools">
                <div className="front-break-tools-head">
                  <div>
                    <p className="tools-watch-kicker">Directory</p>
                    <h2>Top AI Tools</h2>
                  </div>
                  <Link to="/tools" className="tools-watch-link">
                    Catalog →
                  </Link>
                </div>
                <div className="tools-watch-board">
                  {toolWatchlist.slice(0, 5).map((tool) => (
                    <Link key={tool.id} to={`/tools/${tool.id}`} className="tools-watch-row">
                      <div className="tools-watch-left">
                        <strong>{tool.symbol}</strong>
                        <span>
                          {tool.name} · {tool.category}
                        </span>
                      </div>
                      <div className="tools-watch-chart">
                        <Sparkline values={tool.series} up={tool.up} id={tool.id} />
                      </div>
                      <div className="tools-watch-right">
                        <strong>{tool.score}</strong>
                        <span className={`tools-watch-change ${tool.up ? "up" : "down"}`}>
                          {tool.up ? "+" : ""}
                          {tool.change}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="front-shell">
        {filtered.length > 1 ? (
          <div className="front-columns">
            <section className="front-col">
              <h2 className="front-col-label">Also today</h2>
              {leftCol.map((story) => (
                <a
                  key={story._id}
                  className="front-item"
                  href={story.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="front-item-meta">
                    {story.source} · {formatRelativeTime(story.published_at)}
                  </span>
                  <strong>{story.title}</strong>
                  <p>{story.summary}</p>
                </a>
              ))}
            </section>

            <section className="front-col front-col-mid">
              <h2 className="front-col-label">Top reads</h2>
              {midCol.map((story) => (
                <a
                  key={story._id}
                  className="front-feature"
                  href={story.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="front-item-meta">
                    {story.category || "AI"} · {story.source}
                  </span>
                  <h3>{story.title}</h3>
                  <p>{story.summary}</p>
                </a>
              ))}
            </section>

            <section className="front-col">
              <h2 className="front-col-label">Latest</h2>
              <ol className="front-latest">
                {rightCol.map((story, index) => (
                  <li key={story._id}>
                    <a href={story.href} target="_blank" rel="noopener noreferrer">
                      <span className="front-latest-num">{index + 1}</span>
                      <span>
                        <strong>{story.title}</strong>
                        <em>
                          {story.source} · {formatRelativeTime(story.published_at)}
                        </em>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        ) : null}
      </div>

      {stories.length > 0 ? (
        <div className="news-ticker news-ticker-bottom news-ticker-fixed" aria-label="Generated news wire">
          <div className="news-ticker-track">
            {[...stories, ...stories].slice(0, 24).map((story, index) => (
              <a
                key={`${story._id}-${index}`}
                className="news-ticker-item"
                href={story.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                • {story.category || "AI"}: {story.title}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
