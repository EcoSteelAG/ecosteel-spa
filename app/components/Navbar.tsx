// app/components/Navbar.tsx
//
// Obere Navigationsleiste, wie im Wireframe "02 - Asset-Übersicht" entworfen:
// Logo links, Benutzername + Avatar-Kürzel rechts. Modernisiert mit
// dezentem Schatten statt harter Trennlinie und einem Logout-Icon.

import { useNavigate } from "react-router";
import { Logo } from "./Logo";
import { clearAuth, getUserEmail } from "~/lib/auth";

export function Navbar() {
  const navigate = useNavigate();
  const email = getUserEmail() ?? "";
  const initials = email.split("@")[0].slice(0, 2).toUpperCase();

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-white/90 px-6 py-3 shadow-sm backdrop-blur-sm sm:px-8">
      <Logo size="sm" />
      <button
        onClick={handleLogout}
        className="group flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-sm text-gray-600 transition hover:bg-gray-50"
        title="Abmelden"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-eco-green to-eco-green-dark text-xs font-bold text-white shadow-sm">
          {initials || "🙂"}
        </span>
        <span className="hidden sm:inline">{email}</span>
        <span
          className="text-xs text-gray-400 opacity-0 transition group-hover:opacity-100"
          aria-hidden
        >
          🚪
        </span>
      </button>
    </header>
  );
}
