import React from "react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

/**
 * Main App Component
 * Configures ThemeProvider, BrowserRouter, global AuthProvider, common layout (Navbar/Footer),
 * and loads application routes in the Unlumen Minimal Serif design system.
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
            {/* Top Navigation */}
            <Navbar />

            {/* Main Page Content */}
            <main className="flex-grow">
              <AppRoutes />
            </main>

            {/* Bottom Footer */}
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
