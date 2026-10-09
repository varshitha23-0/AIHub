import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import News from "./pages/News";
import Articles from "./pages/Articles";
import ArticleDetails from "./pages/ArticleDetails";
import Tools from "./pages/Tools";
import AddTool from "./pages/AddTool";
import ToolDetails from "./pages/ToolDetails";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PipelineShowcase from "./pages/PipelineShowcase";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/news"
          element={
            <DashboardLayout>
              <News />
            </DashboardLayout>
          }
        />

        <Route
          path="/articles"
          element={
            <DashboardLayout>
              <Articles />
            </DashboardLayout>
          }
        />

        <Route
          path="/articles/:id"
          element={
            <DashboardLayout>
              <ArticleDetails />
            </DashboardLayout>
          }
        />

        <Route
          path="/tools"
          element={
            <DashboardLayout>
              <Tools />
            </DashboardLayout>
          }
        />

        <Route
          path="/tools/add"
          element={
            <DashboardLayout>
              <AddTool />
            </DashboardLayout>
          }
        />

        <Route
          path="/tools/:id"
          element={
            <DashboardLayout>
              <ToolDetails />
            </DashboardLayout>
          }
        />

        <Route
          path="/community"
          element={
            <DashboardLayout>
              <Community />
            </DashboardLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          }
        />

        <Route
          path="/pipeline-showcase"
          element={
            <DashboardLayout>
              <PipelineShowcase />
            </DashboardLayout>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;