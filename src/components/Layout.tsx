import { Link, NavLink, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import React from "react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/upload", label: "Upload" },
  { to: "/train", label: "Train" },
  { to: "/predict", label: "Predict" },
  { to: "/stream", label: "Live Stream" },
  { to: "/analytics", label: "Analytics" },
];

export default function Layout() {
  const location = useLocation();
  React.useEffect(() => {
    const titleMap: Record<string, string> = {
      "/": "UPI Fraud Detection | Home",
      "/upload": "Upload Dataset | UPI Fraud Detection",
      "/train": "Train Model | UPI Fraud Detection",
      "/predict": "Fraud Prediction Tool | UPI Fraud Detection",
      "/stream": "Real-Time Stream | UPI Fraud Detection",
      "/analytics": "Analytics Dashboard | UPI Fraud Detection",
    };
    document.title = titleMap[location.pathname] || "UPI Fraud Detection";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Interactive UPI fraud detection dashboard with dataset upload, in-browser model training, live predictions, and analytics.");
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 focus:outline-none">
            <div className="w-6 h-6 rounded-md" style={{ backgroundImage: 'var(--gradient-primary)' }} aria-hidden />
            <span className="font-semibold">UPI Fraud Detection</span>
          </Link>
          <div className="flex items-center gap-1 flex-wrap">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
              >
                {item.label}
              </NavLink>
            ))}
            <a href="#get-started" className="sr-only">Skip to content</a>
          </div>
          <div className="hidden sm:block">
            <Button asChild variant="hero" size="sm">
              <Link to="/upload">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>
      <main id="get-started" className="container mx-auto px-4 py-6 flex-1 w-full">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} UPI Fraud Detection Demo
      </footer>
    </div>
  );
}
