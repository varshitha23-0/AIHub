import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllTools } from "../api/toolsApi";
import { getErrorMessage } from "../api/api";
import ToolCard from "../components/ToolCard";
import Loader from "../components/Loader";

const CATEGORY_OPTIONS = [
  "Media And Content Creation",
  "Communication And Support",
  "Technology And Development",
  "Operations And Management",
  "Marketing And Sales",
  "Ai And Machine Learning",
  "Business And Finance",
  "Specialized Technologies",
  "Data And Analytics",
  "Creative And Entertainment",
  "Industry Specific",
  "Education And Learning",
  "Personal And Lifestyle",
  "Security And Privacy",
  "LLMs & Chat Assistants",
  "Image Gen & Editing",
  "Video Gen & Editing",
  "Other",
];

export default function Tools() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("az");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState("");

  const limit = 24;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getAllTools(debouncedSearch, category, page, limit);
        setTools(response?.data || []);
        setTotalPages(response?.total_pages || 1);
        setTotalCount(response?.total_count || 0);
      } catch (err) {
        setTools([]);
        setError(getErrorMessage(err, "Failed to load tools"));
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [debouncedSearch, category, page]);

  const sortedTools = [...tools].sort((a, b) => {
    const first = (a.tool_name || "").toLowerCase();
    const second = (b.tool_name || "").toLowerCase();
    return sortOrder === "az"
      ? first.localeCompare(second)
      : second.localeCompare(first);
  });

  return (
    <div className="page solution-page">
      <section className="solution-hero tools">
        <div className="solution-hero-inner">
          <p className="solution-kicker">AI Tools</p>
          <h1>Ship smarter with the right AI stack</h1>
          <p className="solution-lead">
            Browse {totalCount.toLocaleString()} catalog listings
            {category ? ` in “${category}”` : ""} — filter by segment, compare options, and open the details that matter.
          </p>
          <div className="solution-actions">
            <Link to="/tools/add" className="solution-btn primary">
              Add a tool
            </Link>
            <Link to="/news" className="solution-btn ghost">
              Read AI News
            </Link>
          </div>
        </div>
      </section>

      <section className="solution-band soft">
        <div className="solution-band-inner">
          <div className="section-intro">
            <h2>Directory</h2>
            <p>{totalCount.toLocaleString()} tools indexed and ready to explore.</p>
          </div>

          <div className="solution-toolbar triple">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or description..."
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
              <option value="az">Name A-Z</option>
              <option value="za">Name Z-A</option>
            </select>
          </div>

          {category ? (
            <div className="action-row">
              <span className="count-pill">Category: {category}</span>
              <button type="button" className="btn-ghost" onClick={() => setCategory("")}>
                Clear category
              </button>
            </div>
          ) : null}

          {error ? <div className="alert alert-error">{error}</div> : null}
          {loading ? <Loader label="Loading tools..." /> : null}

          {!loading && sortedTools.length === 0 ? (
            <div className="empty-state">
              <h2>No tools found</h2>
              <p>
                {category
                  ? `No tools matched “${category}”. Try All categories or another filter.`
                  : "Try another search or category."}
              </p>
            </div>
          ) : null}

          {!loading && sortedTools.length > 0 ? (
            <div className="tools-grid">
              {sortedTools.map((tool) => (
                <ToolCard key={tool._id} tool={tool} />
              ))}
            </div>
          ) : null}

          <div className="pagination">
            <button
              type="button"
              className="btn-secondary"
              disabled={page === 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </button>
            <span>
              Page {page} / {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              className="btn-secondary"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
