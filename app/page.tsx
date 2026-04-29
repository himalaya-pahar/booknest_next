"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  // FIX: Explicitly type the state so TypeScript knows it can be either a number or a string
  const [stats, setStats] = useState<{
    books: number | string;
    readers: number | string;
    genres: number | string;
  }>({ books: 0, readers: 0, genres: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("https://booknest-backend-fastapi-1.onrender.com/api/booknest-stats");
        if (response.ok) {
          const data = await response.json();
          animateValue("books", data.books);
          animateValue("readers", data.readers);
          animateValue("genres", data.genres);
        } else {
           // If response is not ok, trigger the fallback
           setStats({books: '100+', readers: '500+', genres: '20+'}); 
        }
      } catch (error) {
        // Now TypeScript will accept strings here!
        setStats({books: '100+', readers: '500+', genres: '20+'}); 
      }
    };
    fetchStats();
  }, []);

  const animateValue = (key: string, endValue: number | string) => {
    if(typeof endValue === 'string') return;
    const duration = 1500;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentCount = Math.floor(progress * endValue);
      setStats(prev => ({ ...prev, [key]: currentCount }));
      if (progress < 1) window.requestAnimationFrame(step);
      else setStats(prev => ({ ...prev, [key]: endValue }));
    };
    window.requestAnimationFrame(step);
  };

  // ... (The rest of your JSX remains exactly the same)
  return (
    <>
      <Header />
      {/* Changed background to a very clean off-white commonly used in premium platforms */}
      <main className="flex-grow bg-[#FDFBF7]">
        
        {/* HERO SECTION - SAAS STYLE */}
        <section className="pt-24 pb-20 md:pt-32 md:pb-28 px-5 md:px-[5%] max-w-[1200px] mx-auto text-center flex flex-col items-center">
          
          {/* Subtle, Professional Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-xs font-semibold tracking-wide uppercase py-1.5 px-4 rounded-full mb-8 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            100% Free for Readers
          </div>
          
          {/* High-Contrast, Clean Typography */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1A1512] mb-6 leading-tight max-w-[900px]">
            Every Book Deserves <br className="hidden md:block" />
            <span className="text-[#8B5E3C]">a New Home.</span>
          </h1>
          
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-[650px] mx-auto mb-10">
            BookNest is the community marketplace where avid readers swap stories. List what you've loved, discover what you'll love next — no money involved, just books.
          </p>
          
          {/* Solid, Professional Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto text-center bg-[#2A1A10] text-white py-3.5 px-8 rounded-lg font-medium text-[1.05rem] hover:bg-[#4A3320] transition-colors shadow-sm">
              Start Swapping
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto text-center bg-white text-[#2A1A10] font-medium text-[1.05rem] py-3.5 px-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
              View how it works
            </a>
          </div>

          {/* Crisp, Minimalist Stats */}
          <div className="grid grid-cols-3 gap-8 md:gap-24 mt-20 pt-10 border-t border-gray-200 w-full max-w-[800px]">
            <div className="flex flex-col items-center">
              <div className="font-serif text-3xl md:text-5xl font-bold text-[#1A1512]">{stats.books !== 0 ? stats.books : '--'}</div>
              <div className="text-xs md:text-sm text-gray-500 font-medium mt-2">Books Listed</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="font-serif text-3xl md:text-5xl font-bold text-[#1A1512]">{stats.readers !== 0 ? stats.readers : '--'}</div>
              <div className="text-xs md:text-sm text-gray-500 font-medium mt-2">Active Readers</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="font-serif text-3xl md:text-5xl font-bold text-[#1A1512]">{stats.genres !== 0 ? stats.genres : '--'}</div>
              <div className="text-xs md:text-sm text-gray-500 font-medium mt-2">Genres Covered</div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION - CARD BASED & STRUCTURED */}
        <section id="how-it-works" className="bg-white py-20 md:py-28 px-5 md:px-[5%] border-t border-gray-100">
          <div className="max-w-[1200px] mx-auto">
            
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1A1512] mb-4">How BookNest Works</h2>
              <p className="text-gray-600 text-lg max-w-[600px] mx-auto">
                A simple, transparent process to exchange books with readers in your local community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-[#FDFBF7] border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-white border border-gray-200 text-[#1A1512] font-serif text-xl font-bold rounded-lg flex items-center justify-center mb-6 shadow-sm">
                  1
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1A1512] mb-3">List Your Books</h3>
                <p className="text-gray-600 leading-relaxed">
                  Upload books sitting on your shelf to your personal Nest. Add accurate condition details and categorize them by genre.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#FDFBF7] border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-white border border-gray-200 text-[#1A1512] font-serif text-xl font-bold rounded-lg flex items-center justify-center mb-6 shadow-sm">
                  2
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1A1512] mb-3">Find a Match</h3>
                <p className="text-gray-600 leading-relaxed">
                  Browse our marketplace by genre or author. Send a swap request directly to the owner when you find a book you want to read.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#FDFBF7] border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-white border border-gray-200 text-[#1A1512] font-serif text-xl font-bold rounded-lg flex items-center justify-center mb-6 shadow-sm">
                  3
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1A1512] mb-3">Meet & Exchange</h3>
                <p className="text-gray-600 leading-relaxed">
                  Once your request is accepted, securely view contact details to arrange a local meetup. Exchange the physical books and confirm.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}