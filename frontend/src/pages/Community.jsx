import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createPost, getPosts } from "../api/postApi";
import { getErrorMessage } from "../api/api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import Loader from "../components/Loader";

const TRENDING = [
  { tag: "Agents", label: "AI agents at work" },
  { tag: "OpenSource", label: "Open models this week" },
  { tag: "Tools", label: "New tools to try" },
  { tag: "Research", label: "Papers worth reading" },
];

export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", content: "" });
  const [composerOpen, setComposerOpen] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setPosts([]);
      setError(getErrorMessage(err, "Failed to load posts"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) return;

    setSubmitting(true);
    setError("");

    try {
      const result = await createPost({
        user_id: user.id,
        title: form.title.trim() || form.content.trim().slice(0, 72),
        content: form.content.trim(),
        media: [],
      });

      if (result?.post) {
        setPosts((prev) => [result.post, ...prev]);
      } else {
        await loadPosts();
      }

      setForm({ title: "", content: "" });
      setComposerOpen(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create post"));
    } finally {
      setSubmitting(false);
    }
  };

  const activeMembers = useMemo(() => {
    const names = new Map();
    posts.forEach((post) => {
      const name =
        post.username ||
        (post.author && post.author !== post.user_id ? post.author : null) ||
        (post.user_id ? `Member ${String(post.user_id).slice(-4)}` : "Member");
      names.set(name, (names.get(name) || 0) + 1);
    });
    return [...names.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [posts]);

  return (
    <div className="page community-page">
      <header className="community-topbar">
        <div className="community-topbar-inner">
          <div>
            <p className="community-kicker">Social</p>
            <h1>Community</h1>
          </div>
          {isAuthenticated ? (
            <div className="community-top-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setComposerOpen(true)}
              >
                Create post
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="community-layout">
        <aside className="community-rail left">
          <div className="community-rail-card">
            <h3>Your space</h3>
            {isAuthenticated ? (
              <div className="community-profile-chip">
                <div className="community-avatar">
                  {user.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <strong>{user.username}</strong>
                  <p className="meta-text">Posting as you</p>
                </div>
              </div>
            ) : (
              <p className="meta-text">
                <Link to="/login">Sign in</Link> to join the feed.
              </p>
            )}
          </div>

          <div className="community-rail-card">
            <h3>Shortcuts</h3>
            <nav className="community-shortcuts">
              <a href="#feed">Feed</a>
              <a href="#composer">Composer</a>
              <Link to="/news">Latest news</Link>
              <Link to="/tools">AI tools</Link>
            </nav>
          </div>
        </aside>

        <main className="community-feed" id="feed">
          <section className="fb-composer" id="composer">
            <div className="fb-composer-top">
              <div className="community-avatar">
                {isAuthenticated
                  ? user.username?.charAt(0)?.toUpperCase() || "U"
                  : "?"}
              </div>
              {isAuthenticated ? (
                <button
                  type="button"
                  className="fb-composer-trigger"
                  onClick={() => setComposerOpen(true)}
                >
                  What’s on your mind, {user.username}?
                </button>
              ) : (
                <Link to="/login" className="fb-composer-trigger">
                  Login to share what’s on your mind
                </Link>
              )}
            </div>

            {isAuthenticated && composerOpen ? (
              <form className="fb-composer-form" onSubmit={handleSubmit}>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Add a headline (optional)"
                />
                <textarea
                  value={form.content}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, content: event.target.value }))
                  }
                  rows={4}
                  placeholder="Share an update, question, or take..."
                  required
                />
                <div className="fb-composer-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setComposerOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>
            ) : null}

            <div className="fb-composer-quick">
              <span>Trends</span>
              <span>Questions</span>
              <span>Tool finds</span>
            </div>
          </section>

          {error ? <div className="alert alert-error">{error}</div> : null}
          {loading ? <Loader label="Loading feed..." /> : null}

          {!loading && posts.length === 0 ? (
            <div className="fb-empty">
              <h2>No posts in the feed yet</h2>
              <p>Be the first to start a conversation in the community.</p>
            </div>
          ) : null}

          {!loading && posts.length > 0 ? (
            <div className="fb-feed-list">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDeleted={(id) =>
                    setPosts((prev) => prev.filter((item) => item._id !== id))
                  }
                />
              ))}
            </div>
          ) : null}
        </main>

        <aside className="community-rail right">
          <div className="community-rail-card">
            <h3>Trending now</h3>
            <ul className="community-trends">
              {TRENDING.map((item) => (
                <li key={item.tag}>
                  <span>#{item.tag}</span>
                  <strong>{item.label}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="community-rail-card">
            <h3>Active members</h3>
            {activeMembers.length === 0 ? (
              <p className="meta-text">Post to show up here.</p>
            ) : (
              <ul className="community-members">
                {activeMembers.map((member) => (
                  <li key={member.name}>
                    <div className="community-avatar sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{member.name}</strong>
                      <p className="meta-text">
                        {member.count} post{member.count === 1 ? "" : "s"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="community-rail-card quiet">
            <h3>Community pulse</h3>
            <ul className="daily-glance">
              <li>
                <span>Posts</span>
                <strong>{posts.length}</strong>
              </li>
              <li>
                <span>Members seen</span>
                <strong>{activeMembers.length}</strong>
              </li>
              <li>
                <span>Status</span>
                <strong>{isAuthenticated ? "Online" : "Guest"}</strong>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
