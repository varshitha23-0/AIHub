import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getToolById } from "../api/toolsApi";
import { getErrorMessage } from "../api/api";
import { formatDate } from "../utils/article";
import { getToolImageCandidates } from "../utils/toolImage";
import Loader from "../components/Loader";

export default function ToolDetails() {
  const { id } = useParams();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const fetchTool = async () => {
      setLoading(true);
      setError("");
      setImageIndex(0);

      try {
        const data = await getToolById(id);

        if (!data || data.message === "Tool not found" || !data._id) {
          setTool(null);
          setError("Tool not found");
          return;
        }

        setTool(data);
      } catch (err) {
        setTool(null);
        setError(getErrorMessage(err, "Failed to load tool"));
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  if (loading) return <Loader label="Loading tool..." />;

  if (error || !tool) {
    return (
      <div className="page">
        <Link to="/tools" className="text-link">
          ← Back to tools
        </Link>
        <div className="empty-state">
          <h2>Tool unavailable</h2>
          <p>{error || "This tool could not be loaded."}</p>
        </div>
      </div>
    );
  }

  const keywords = Array.isArray(tool.keywords) ? tool.keywords : [];
  const name = tool.tool_name || tool.name || "Unnamed tool";
  const candidates = getToolImageCandidates(tool);
  const imageSrc = candidates[imageIndex] || null;

  return (
    <div className="page">
      <Link to="/tools" className="text-link">
        ← Back to tools
      </Link>

      <div className="tool-details-hero">
        <div className="tool-logo large">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={name}
              referrerPolicy="no-referrer"
              onError={() =>
                setImageIndex((prev) =>
                  prev + 1 < candidates.length ? prev + 1 : candidates.length
                )
              }
            />
          ) : (
            <span>{name.charAt(0)}</span>
          )}
        </div>
        <div>
          <div className="tag-row">
            <span className="badge badge-success">{tool.category || "AI Tool"}</span>
            {tool.featured ? <span className="badge badge-warn">Featured</span> : null}
          </div>
          <h1>{name}</h1>
          {tool.company ? <p className="company-line">{tool.company}</p> : null}
          <p className="page-subtitle">{tool.description}</p>
        </div>
      </div>

      <div className="details-grid">
        <div>
          <span className="meta-label">Website</span>
          {tool.website ? (
            <a href={tool.website} target="_blank" rel="noopener noreferrer" className="text-link">
              {tool.website}
            </a>
          ) : (
            <strong>Not listed</strong>
          )}
        </div>
        <div>
          <span className="meta-label">Primary task</span>
          <strong>{tool.primary_task || "—"}</strong>
        </div>
        <div>
          <span className="meta-label">Country</span>
          <strong>{tool.country || "—"}</strong>
        </div>
        <div>
          <span className="meta-label">Industry</span>
          <strong>{tool.industry || "—"}</strong>
        </div>
        <div>
          <span className="meta-label">Open source</span>
          <strong>{tool.open_source ? "Yes" : "No"}</strong>
        </div>
        <div>
          <span className="meta-label">API available</span>
          <strong>{tool.api_available ? "Yes" : "No"}</strong>
        </div>
        <div>
          <span className="meta-label">Stars</span>
          <strong>{tool.stars ?? 0}</strong>
        </div>
        <div>
          <span className="meta-label">Added</span>
          <strong>{formatDate(tool.created_at, "—")}</strong>
        </div>
      </div>

      {keywords.length > 0 ? (
        <div className="section-block">
          <h3>Keywords</h3>
          <div className="tag-row">
            {keywords.map((keyword) => (
              <span key={keyword} className="tag">
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
