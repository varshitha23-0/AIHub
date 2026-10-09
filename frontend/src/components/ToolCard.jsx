import { useState } from "react";
import { Link } from "react-router-dom";
import { cleanKeywords } from "../utils/article";
import { getToolImageCandidates } from "../utils/toolImage";

export default function ToolCard({ tool }) {
  if (!tool) return null;

  const keywords = cleanKeywords(tool.keywords || tool.tags);
  const name = tool.tool_name || tool.name || "Unnamed tool";
  const candidates = getToolImageCandidates(tool);
  const [imageIndex, setImageIndex] = useState(0);
  const imageSrc = candidates[imageIndex] || null;

  const handleImageError = () => {
    setImageIndex((prev) => (prev + 1 < candidates.length ? prev + 1 : candidates.length));
  };

  return (
    <article className="tool-card">
      <div className="tool-card-media">
        <div className="tool-card-media-badge">
          {tool.featured ? <span className="badge badge-warn">Featured</span> : null}
          <span className="badge badge-success">{tool.category || "AI Tool"}</span>
        </div>

        <div className="tool-card-visual">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />
          ) : (
            <span className="tool-card-fallback" aria-hidden="true">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="tool-card-body">
        <h2 title={name}>{name}</h2>
        {tool.company ? <p className="company-line">{tool.company}</p> : null}
        <p className="card-summary">{tool.description || "No description available."}</p>

        <div className="info-grid">
          <div>
            <span className="meta-label">Task</span>
            <strong>{tool.primary_task || "General"}</strong>
          </div>
          <div>
            <span className="meta-label">API</span>
            <strong>{tool.api_available ? "Available" : "Not listed"}</strong>
          </div>
        </div>

        {keywords.length > 0 ? (
          <div className="tag-row">
            {keywords.slice(0, 4).map((word) => (
              <span key={word} className="tag">
                #{word}
              </span>
            ))}
          </div>
        ) : null}

        <div className="action-row">
          {tool.website ? (
            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Visit
            </a>
          ) : null}
          <Link to={`/tools/${tool._id}`} className="btn-secondary">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
