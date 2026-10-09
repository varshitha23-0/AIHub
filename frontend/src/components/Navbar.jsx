import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navLinks = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "AI News", path: "/news" },
  { name: "AI Articles", path: "/articles" },
  { name: "AI Tools", path: "/tools" },
  { name: "Community", path: "/community" },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar-inner topbar-inner-no-brand">
        <nav className="top-nav" aria-label="Main">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `top-nav-link ${isActive ? "active" : ""}`}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-auth">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="auth-user">
                {user.username}
              </Link>
              <button type="button" className="auth-btn ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-btn ghost">
                Login
              </Link>
              <Link to="/register" className="auth-btn solid">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
