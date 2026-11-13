import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import MobileNav from "./MobileNav.jsx";

/**
 * The shared page chrome: header, main landmark, footer and the mobile
 * bottom navigation. Every route renders inside this shell.
 */
export function AppLayout() {
  const { pathname } = useLocation();

  // Scroll to the top on every navigation (but keep the position on in-page
  // anchor links).
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [pathname]);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header />
      <main id="main" className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

export default AppLayout;
