import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addTool } from "../api/toolsApi";
import { getErrorMessage } from "../api/api";

const initialForm = {
  tool_name: "",
  category: "",
  description: "",
  website: "",
  company: "",
  logo: "",
  keywords: "",
  primary_task: "",
  country: "",
  industry: "",
  year_founded: "",
  release_year: "",
  open_source: false,
  api_available: false,
  stars: 0,
  featured: false,
};

export default function AddTool() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        keywords: formData.keywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        year_founded: formData.year_founded ? Number(formData.year_founded) : null,
        release_year: formData.release_year ? Number(formData.release_year) : null,
        stars: Number(formData.stars) || 0,
      };

      await addTool(payload);
      navigate("/tools");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add AI tool"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Add New AI Tool</h1>
          <p className="page-subtitle">Submit a listing into the live tools directory.</p>
        </div>
        <Link to="/tools" className="btn-secondary">
          Back to tools
        </Link>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="form-grid">
          <label className="field">
            <span>Tool name *</span>
            <input name="tool_name" value={formData.tool_name} onChange={handleChange} required />
          </label>

          <label className="field">
            <span>Company</span>
            <input name="company" value={formData.company} onChange={handleChange} />
          </label>

          <label className="field">
            <span>Category *</span>
            <input name="category" value={formData.category} onChange={handleChange} required />
          </label>

          <label className="field">
            <span>Website *</span>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://"
              required
            />
          </label>

          <label className="field">
            <span>Logo URL</span>
            <input name="logo" value={formData.logo} onChange={handleChange} />
          </label>

          <label className="field">
            <span>Primary task</span>
            <input name="primary_task" value={formData.primary_task} onChange={handleChange} />
          </label>

          <label className="field">
            <span>Country</span>
            <input name="country" value={formData.country} onChange={handleChange} />
          </label>

          <label className="field">
            <span>Industry</span>
            <input name="industry" value={formData.industry} onChange={handleChange} />
          </label>

          <label className="field">
            <span>Year founded</span>
            <input
              type="number"
              name="year_founded"
              value={formData.year_founded}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>Release year</span>
            <input
              type="number"
              name="release_year"
              value={formData.release_year}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>Stars</span>
            <input
              type="number"
              step="0.1"
              name="stars"
              value={formData.stars}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>Keywords</span>
            <input
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="AI, Chatbot, Coding"
            />
          </label>

          <label className="field field-full">
            <span>Description *</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </label>
        </div>

        <div className="checkbox-row">
          <label>
            <input
              type="checkbox"
              name="open_source"
              checked={formData.open_source}
              onChange={handleChange}
            />
            Open source
          </label>
          <label>
            <input
              type="checkbox"
              name="api_available"
              checked={formData.api_available}
              onChange={handleChange}
            />
            API available
          </label>
          <label>
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
            />
            Featured
          </label>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Adding tool..." : "Add AI tool"}
        </button>
      </form>
    </div>
  );
}
