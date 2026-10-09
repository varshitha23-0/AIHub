import { NavLink } from "react-router-dom";

const sidebarItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "AI News", path: "/news" },
  { name: "Articles", path: "/articles" },
  { name: "AI Tools", path: "/tools" },
  { name: "Add Tool", path: "/tools/add" },
  { name: "Community", path: "/community" },
  { name: "Profile", path: "/profile" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">AI Platform</h2>
      <div className="sidebar-menu">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/tools"}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            {item.name}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
