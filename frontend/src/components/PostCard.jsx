import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addComment, getComments, removeComment } from "../api/commentsApi";
import { deletePost } from "../api/postApi";
import { getErrorMessage } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { formatRelativeTime } from "../utils/article";

export default function PostCard({ post, onDeleted }) {
  const { user, isAuthenticated } = useAuth();
  const [likes, setLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canDelete = isAuthenticated && user?.id && post.user_id === user.id;
  const author =
    (canDelete && user?.username) ||
    post.username ||
    (post.author && post.author !== post.user_id ? post.author : null) ||
    (post.user_id ? `User ${String(post.user_id).slice(-6)}` : "Anonymous");

  const loadComments = async () => {
    setLoadingComments(true);
    setError("");
    try {
      const data = await getComments(post._id);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load comments"));
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, post._id]);

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setError("Login to comment.");
      return;
    }
    if (!commentText.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      await addComment({
        post_id: post._id,
        user_id: user.id,
        username: user.username,
        content: commentText.trim(),
      });
      setCommentText("");
      await loadComments();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add comment"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await removeComment(commentId);
      setComments((prev) => prev.filter((item) => item._id !== commentId));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete comment"));
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post._id);
      onDeleted?.(post._id);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete post"));
    }
  };

  const toggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikes((value) => Math.max(0, value + (next ? 1 : -1)));
      return next;
    });
  };

  const commentCount = comments.length || post.comments?.length || 0;

  return (
    <article className="fb-post">
      <header className="fb-post-head">
        <div className="fb-post-author">
          <div className="community-avatar">{author.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{author}</strong>
            <p className="meta-text">{formatRelativeTime(post.created_at)}</p>
          </div>
        </div>
        {canDelete ? (
          <button type="button" className="fb-icon-btn danger" onClick={handleDeletePost}>
            Delete
          </button>
        ) : null}
      </header>

      {post.title ? <h3 className="fb-post-title">{post.title}</h3> : null}
      <p className="fb-post-body">{post.content}</p>

      <div className="fb-post-stats">
        <span>{likes} likes</span>
        <button type="button" className="fb-text-btn" onClick={() => setShowComments(true)}>
          {commentCount} comments
        </button>
      </div>

      <div className="fb-post-actions">
        <button
          type="button"
          className={`fb-action ${liked ? "active" : ""}`}
          onClick={toggleLike}
        >
          {liked ? "Liked" : "Like"}
        </button>
        <button
          type="button"
          className="fb-action"
          onClick={() => setShowComments((value) => !value)}
        >
          Comment
        </button>
        <button type="button" className="fb-action" disabled>
          Share
        </button>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {showComments ? (
        <div className="fb-comments">
          {loadingComments ? <p className="meta-text">Loading comments...</p> : null}

          {!loadingComments && comments.length === 0 ? (
            <p className="meta-text">No comments yet. Start the thread.</p>
          ) : null}

          <div className="fb-comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="fb-comment">
                <div className="community-avatar sm">
                  {(comment.username || "U").charAt(0).toUpperCase()}
                </div>
                <div className="fb-comment-bubble">
                  <div className="fb-comment-top">
                    <strong>{comment.username || comment.user_id || "User"}</strong>
                    <span className="meta-text">{formatRelativeTime(comment.created_at)}</span>
                  </div>
                  <p>{comment.content}</p>
                  {isAuthenticated && user?.id === comment.user_id ? (
                    <button
                      type="button"
                      className="fb-text-btn danger"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {isAuthenticated ? (
            <form className="fb-comment-form" onSubmit={handleAddComment}>
              <div className="community-avatar sm">
                {user.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Write a comment..."
                required
              />
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "..." : "Reply"}
              </button>
            </form>
          ) : (
            <p className="meta-text">
              <Link to="/login">Login</Link> to join the discussion.
            </p>
          )}
        </div>
      ) : null}
    </article>
  );
}
