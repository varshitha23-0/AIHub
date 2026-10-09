import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="page solution-page">
      <section className="solution-hero profile">
        <div className="solution-hero-inner">
          <p className="solution-kicker">Account</p>
          <h1>{isAuthenticated ? `Welcome, ${user.username}` : "Your AI Hub profile"}</h1>
          <p className="solution-lead">
            {isAuthenticated
              ? "Manage your signed-in identity and keep community posting unlocked."
              : "Sign in to unlock community posting and keep your newsroom identity synced."}
          </p>
          <div className="solution-actions">
            {isAuthenticated ? (
              <button type="button" className="solution-btn primary" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="solution-btn primary">
                  Login
                </Link>
                <Link to="/register" className="solution-btn ghost">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="solution-band soft">
        <div className="solution-band-inner">
          {isAuthenticated ? (
            <div className="compose-panel">
              <h2>Profile details</h2>
              <div className="profile-grid" style={{ marginTop: "1rem" }}>
                <div>
                  <span className="meta-label">Username</span>
                  <strong>{user.username}</strong>
                </div>
                <div>
                  <span className="meta-label">Email</span>
                  <strong>{user.email}</strong>
                </div>
                <div>
                  <span className="meta-label">Role</span>
                  <strong>{user.role || "user"}</strong>
                </div>
                <div>
                  <span className="meta-label">User ID</span>
                  <strong className="mono">{user.id}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h2>You are not signed in</h2>
              <p>Login to see your account details and post in the community.</p>
              <div className="action-row">
                <Link to="/login" className="btn-primary">
                  Login
                </Link>
                <Link to="/register" className="btn-secondary">
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
