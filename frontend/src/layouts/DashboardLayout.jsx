import Navbar from "../components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="app-layout desk-mode">
      <Navbar />
      <main className="content-area">{children}</main>
    </div>
  );
}
