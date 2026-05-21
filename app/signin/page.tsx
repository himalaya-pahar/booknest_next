"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    // Backend expects URLSearchParams for login
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await fetch("https://booknest-backend-fastapi.vercel.app/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("currentUserEmail", email);
        router.push("/marketplace");
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Server connection failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <header className="p-5 relative z-10 flex justify-center mt-4">
        <Link href="/" className="font-serif text-3xl font-bold text-chocolate flex items-center gap-2">
          <div className="w-[40px] h-[40px] bg-gradient-to-br from-chocolate to-mahogany rounded-lg flex items-center justify-center text-parchment text-xl shadow-md">📚</div>
          <span>BookNest</span>
        </Link>
      </header>

      <div className="flex-grow flex items-center justify-center px-5 py-10 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_40px_rgba(92,61,46,0.12)] border border-white w-full max-w-md text-center animate-fadeUp">
          
          <h2 className="text-3xl font-bold text-ink mb-2 font-serif">Welcome Back</h2>
          <p className="text-muted text-sm mb-8">Sign in to continue your reading journey.</p>
          
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 border border-chocolate/20 rounded-xl outline-none focus:border-chocolate focus:ring-2 focus:ring-chocolate/10 transition-all font-sans bg-white/80"
              placeholder="Enter your email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 border border-chocolate/20 rounded-xl outline-none focus:border-chocolate focus:ring-2 focus:ring-chocolate/10 transition-all font-sans bg-white/80"
              placeholder="Password"
              required
            />
            
            {error && (
              <p className="text-red-500 font-medium text-sm text-left bg-red-50 p-2 rounded-md border border-red-100">
                Invalid email or password.
              </p>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-chocolate to-mahogany text-parchment font-serif text-[1.1rem] py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(92,61,46,0.3)] transition-all mt-2">
              Log In
            </button>
          </form>
          
          <p className="mt-8 text-muted text-sm">
            Don't have an account? <Link href="/signup" className="text-chocolate font-bold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}