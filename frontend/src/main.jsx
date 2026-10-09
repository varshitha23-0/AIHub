import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./App.css";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(
    document.getElementById("root")
).render(

    <React.StrictMode>

        <AuthProvider>

            <ThemeProvider>

                <ErrorBoundary>

                    <App />

                </ErrorBoundary>

            </ThemeProvider>

        </AuthProvider>

    </React.StrictMode>

);