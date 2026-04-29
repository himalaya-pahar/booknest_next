"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{token: string | null, email: string | null}>({ token: null, email: null });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("currentUserEmail");
    setUser({ token, email });

    const protectedPages = ["/marketplace", "/mynest", "/history", "/wishlist"];
    if (!token && protectedPages.some(page => pathname.includes(page))) {
      router.push("/signin");
    }
  }, [pathname, router]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("currentUserEmail");
    setUser({ token: null, email: null });
    router.push("/");
  };

  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "ME";
  const isLogged = !!user.token;

  return (
    // Fixed: Changed bg-card to bg-warm-white
    <header className="sticky top-0 z-50 bg-warm-white border-b border-border shadow-sm">
      <div className="px-5 md:px-[5%] py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link href={isLogged ? "/marketplace" : "/"} className="font-serif text-xl md:text-2xl font-bold text-chocolate flex items-center gap-2">
          <div className="w-[38px] h-[38px] bg-gradient-to-br from-chocolate to-mahogany rounded-lg flex items-center justify-center text-parchment text-xl shadow-sm">📚</div>
          <span>BookNest</span>
        </Link>
        
        {/* Desktop Navigation */}
        {isLogged && pathname !== '/' && (
          <nav className="hidden md:flex gap-6">
            <Link href="/marketplace" className={`font-sans text-sm font-semibold transition-colors ${pathname === '/marketplace' ? 'text-chocolate' : 'text-muted hover:text-chocolate'}`}>Marketplace</Link>
            <Link href="/mynest" className={`font-sans text-sm font-semibold transition-colors ${pathname === '/mynest' ? 'text-chocolate' : 'text-muted hover:text-chocolate'}`}>My Nest</Link>
            <Link href="/wishlist" className={`font-sans text-sm font-semibold transition-colors ${pathname === '/wishlist' ? 'text-chocolate' : 'text-muted hover:text-chocolate'}`}>Wishlist</Link>
            <Link href="/history" className={`font-sans text-sm font-semibold transition-colors ${pathname === '/history' ? 'text-chocolate' : 'text-muted hover:text-chocolate'}`}>History</Link>
          </nav>
        )}

        {/* Actions & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 md:gap-4">
          {isLogged ? (
            <>
              <div className="w-[35px] h-[35px] bg-gradient-to-br from-chocolate to-mahogany rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {initials}
              </div>
              <button onClick={handleLogout} className="hidden md:block px-4 py-1.5 border-2 border-chocolate text-chocolate rounded-full text-sm font-semibold hover:bg-chocolate/5 transition-colors">
                Log Out
              </button>
              {pathname !== '/' && (
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-chocolate text-2xl focus:outline-none p-1">
                  {isMenuOpen ? '✖' : '☰'}
                </button>
              )}
            </>
          ) : (
            <>
               {pathname === '/' && <a href="#how-it-works" className="hidden md:inline-block font-sans text-sm font-medium text-muted hover:text-chocolate transition-colors">How it Works</a>}
               <Link href="/signin" className="px-5 py-2 bg-chocolate text-parchment rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all">
                 Sign In
               </Link>
            </>
          )}
        </div>
      </div>

      {/* Fixed: Mobile Menu uses bg-warm-white too */}
      {isLogged && isMenuOpen && pathname !== '/' && (
        <div className="md:hidden bg-warm-white border-t border-border px-5 py-4 flex flex-col gap-4 shadow-lg absolute w-full left-0 animate-fadeUp">
          <Link href="/marketplace" onClick={() => setIsMenuOpen(false)} className={`font-sans text-lg font-semibold ${pathname === '/marketplace' ? 'text-chocolate' : 'text-muted'}`}>Marketplace</Link>
          <Link href="/mynest" onClick={() => setIsMenuOpen(false)} className={`font-sans text-lg font-semibold ${pathname === '/mynest' ? 'text-chocolate' : 'text-muted'}`}>My Nest</Link>
          <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className={`font-sans text-lg font-semibold ${pathname === '/wishlist' ? 'text-chocolate' : 'text-muted'}`}>Wishlist</Link>
          <Link href="/history" onClick={() => setIsMenuOpen(false)} className={`font-sans text-lg font-semibold ${pathname === '/history' ? 'text-chocolate' : 'text-muted'}`}>History</Link>
          <button onClick={handleLogout} className="w-full text-left font-sans text-lg font-semibold text-red-600 mt-2 pt-4 border-t border-border">Log Out</button>
        </div>
      )}
    </header>
  );
}