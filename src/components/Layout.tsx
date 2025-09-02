import { Link, NavLink, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import ChatAssistant from "@/components/ChatAssistant";
import logo from "@/assets/logo-clean.png";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/upload", label: "Upload" },
  { to: "/train", label: "Train" },
  { to: "/predict", label: "Predict" },
  { to: "/stream", label: "Live Stream" },
  { to: "/analytics", label: "Analytics" },
  { to: "/contact", label: "Contact" },
];

export default function Layout() {
  const location = useLocation();
  const [authed, setAuthed] = React.useState(false);
  const isHomePage = location.pathname === "/";

  React.useEffect(() => {
    const titleMap: Record<string, string> = {
      "/": "UPI Fraud Detection | Home",
      "/upload": "Upload Dataset | UPI Fraud Detection",
      "/train": "Train Model | UPI Fraud Detection",
      "/predict": "Fraud Prediction Tool | UPI Fraud Detection",
      "/stream": "Real-Time Stream | UPI Fraud Detection",
      "/analytics": "Analytics Dashboard | UPI Fraud Detection",
      "/contact": "Contact Us | UPI Fraud Detection",
    };
    document.title = titleMap[location.pathname] || "UPI Fraud Detection";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Interactive UPI fraud detection dashboard with dataset upload, in-browser model training, live predictions, and analytics.");
  }, [location.pathname]);

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-lavender-elegant">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 focus:outline-none">
            <img src={logo} alt="UPI Fraud Detection Logo" className="w-12 h-12" />
            <span className="font-brand text-2xl bg-gradient-text bg-clip-text text-transparent">
              UPI Fraud Detection
            </span>
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
          <div className="hidden sm:flex items-center gap-2">
            <Button asChild variant="hero" size="sm">
              <Link to="/upload">Get Started</Link>
            </Button>
            {authed ? (
              <Button size="sm" variant="outline" onClick={async () => { await supabase.auth.signOut(); }}>
                Logout
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline">
                <Link to="/auth">Login</Link>
              </Button>
            )}
          </div>
        </nav>
      </header>
      <main id="get-started" className="container mx-auto px-6 py-8 flex-1 w-full">
        <div className="content-overlay rounded-xl p-8">
          <Outlet />
        </div>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} UPI Fraud Detection Demo
      </footer>
      
      <ChatAssistant />
    </div>
  );
}
