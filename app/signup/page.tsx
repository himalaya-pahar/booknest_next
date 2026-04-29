"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function SignUp() {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Combine names to match backend schema
    const fullName = `${fname} ${lname}`;

    const userData = {
      name: fullName,
      email: email,
      password: password,
    };

    try {
      const response = await fetch("https://booknest-backend-fastapi-1.onrender.com/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert("Account created successfully! Please log in.");
        router.push("/signin");
      } else {
        const error = await response.json();
        setErrorMsg(`Signup failed: ${error.detail || "Something went wrong"}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      setErrorMsg("Cannot connect to server. Is the backend running?");
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

      <div className="flex-grow flex items-center justify-center px-5 py-6 relative z-10">
        <div className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_40px_rgba(92,61,46,0.12)] border border-white w-full max-w-md text-center animate-fadeUp">
          
          <h2 className="text-3xl font-bold text-ink mb-2 font-serif">Join BookNest</h2>
          <p className="text-muted text-sm mb-8">Create an account to start swapping books.</p>
          
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                className="w-full p-3.5 border border-chocolate/20 rounded-xl outline-none focus:border-chocolate focus:ring-2 focus:ring-chocolate/10 transition-all font-sans bg-white/80"
                placeholder="First Name"
                required
              />
              <input
                type="text"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                className="w-full p-3.5 border border-chocolate/20 rounded-xl outline-none focus:border-chocolate focus:ring-2 focus:ring-chocolate/10 transition-all font-sans bg-white/80"
                placeholder="Last Name"
                required
              />
            </div>
            
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 border border-chocolate/20 rounded-xl outline-none focus:border-chocolate focus:ring-2 focus:ring-chocolate/10 transition-all font-sans bg-white/80"
              placeholder="Email Address"
              required
            />
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 border border-chocolate/20 rounded-xl outline-none focus:border-chocolate focus:ring-2 focus:ring-chocolate/10 transition-all font-sans bg-white/80"
              placeholder="Create Password"
              required
            />
            
            {errorMsg && (
              <p className="text-red-500 font-medium text-sm text-left bg-red-50 p-2 rounded-md border border-red-100">
                {errorMsg}
              </p>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-chocolate to-mahogany text-parchment font-serif text-[1.1rem] py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(92,61,46,0.3)] transition-all mt-2">
              Sign Up
            </button>
          </form>
          
          <p className="mt-8 text-muted text-sm">
            Already have an account? <Link href="/signin" className="text-chocolate font-bold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}