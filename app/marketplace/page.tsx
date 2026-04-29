"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface BookLogItem { id: number; name: string; author: string; genre: string; owner_name: string; }
interface MyBook { id: number; name: string; author: string; }

export default function Marketplace() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [books, setBooks] = useState<BookLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentGenre, setCurrentGenre] = useState('All');
  const genres = ['All', 'Fiction', 'Thriller', 'Academic', 'Sci-Fi'];

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wantedBook, setWantedBook] = useState<{id: number, title: string} | null>(null);
  const [myBooks, setMyBooks] = useState<MyBook[]>([]);
  const [selectedOffer, setSelectedOffer] = useState('');
  const [swapError, setSwapError] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) { router.push('/signin'); return; }
    setToken(storedToken);
    loadBooks(storedToken, searchQuery, currentGenre);
  }, [router]);

  const loadBooks = async (currentToken: string, query: string, genre: string) => {
    setLoading(true);
    try {
      let url = new URL("https://booknest-backend-fastapi-1.onrender.com/booklog");
      if (query) url.searchParams.append("q", query);
      if (genre !== "All") url.searchParams.append("genre", genre);

      const response = await fetch(url.toString(), { headers: { Authorization: `Bearer ${currentToken}` } });
      if (response.status === 401) { router.push('/signin'); return; }
      if (response.status === 404) setBooks([]); 
      else {
        const data = await response.json();
        setBooks(Array.isArray(data) ? data : []);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleSearch = () => { if(token) loadBooks(token, searchQuery, currentGenre); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };
  const handleGenreClick = (genre: string) => { setCurrentGenre(genre); if(token) loadBooks(token, searchQuery, genre); };

  const openSwapModal = async (bookId: number, bookTitle: string) => {
    if(!token) return;
    setWantedBook({ id: bookId, title: bookTitle });
    setSwapError('');
    setSelectedOffer('');
    setIsModalOpen(true);
    setMyBooks([]); 

    try {
      const response = await fetch("https://booknest-backend-fastapi-1.onrender.com/book/", { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setMyBooks(Array.isArray(data) ? data : []);
      }
    } catch (error) { setSwapError("Error loading your books"); }
  };

  const confirmSwap = async () => {
    if (!selectedOffer) { setSwapError("Please select a book to offer."); return; }
    try {
      const response = await fetch(`https://booknest-backend-fastapi-1.onrender.com/booklog/request?offered_book=${selectedOffer}&wanted_book=${wantedBook?.id}`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setToast({ message: "Swap request sent successfully!", type: "success" });
        setIsModalOpen(false);
        setTimeout(() => setToast(null), 3000);
      } else {
        const errorData = await response.json();
        setSwapError(errorData.detail || "Failed to send request.");
      }
    } catch (error) { setSwapError("Network error occurred."); }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F0] font-sans text-[#2A1A10]">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f5ecd7]/60 to-[#FDF8F0] py-[60px] px-[20px] text-center border-b border-black/5">
        <div className="max-w-[800px] mx-auto">
          <h1 className="font-serif text-[2.5rem] md:text-[3.5rem] font-bold mb-[15px]">
            Give Old Stories <span className="text-[#8B5E3C] italic">New Life</span>
          </h1>
          <p className="text-[#7A6050] text-[1.1rem] mb-[30px]">Join the community of readers swapping novels, textbooks, and comics for free.</p>
          
          <div className="flex flex-col sm:flex-row gap-[10px] max-w-[600px] mx-auto mb-[30px]">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by title, author..." 
              className="flex-grow p-[15px_20px] border border-[#ddd] rounded-[50px] outline-none text-[1rem] bg-white shadow-sm focus:border-[#5C3D2E]"
            />
            <button onClick={handleSearch} className="bg-[#5C3D2E] text-white px-[30px] py-[15px] rounded-[50px] font-semibold hover:-translate-y-0.5 shadow-md transition-all">
              Search
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-[10px]">
            {genres.map(genre => (
              <button 
                key={genre} onClick={() => handleGenreClick(genre)}
                className={`px-[16px] py-[8px] rounded-[20px] text-[0.9rem] transition-colors ${currentGenre === genre ? 'bg-[#5C3D2E] text-white' : 'bg-[#e8e4db] text-[#2A1A10] hover:bg-[#5C3D2E] hover:text-white'}`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-[20px] py-[40px]">
        <h2 className="font-serif text-[1.8rem] font-bold text-[#2A1A10] mb-[25px]">Trending Swaps</h2>

        {loading ? (
          <p className="text-center text-[#7A6050]">Loading marketplace...</p>
        ) : books.length === 0 ? (
          <p className="text-center text-[#7A6050] py-[40px]">No books match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[25px]">
            {books.map(book => {
              const initial = book.owner_name ? book.owner_name.charAt(0).toUpperCase() : "?";
              return (
                <div key={book.id} className="bg-[#FEFCF8] rounded-[12px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all flex flex-col group border border-black/5">
                  <div className="h-[250px] bg-[#f0f0f0] relative">
                    <span className="absolute top-[10px] right-[10px] bg-white/95 px-[10px] py-[4px] rounded-[12px] text-[0.75rem] font-bold text-[#5C3D2E] z-10">
                      {book.genre}
                    </span>
                    <img src={`https://placehold.co/400x600/2c5e50/FFF?text=${encodeURIComponent(book.name.substring(0,10))}`} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-[15px] flex flex-col flex-grow">
                    <h3 className="font-serif text-[1.1rem] font-bold text-[#2A1A10] mb-[5px] truncate" title={book.name}>{book.name}</h3>
                    <p className="text-[0.9rem] text-[#7A6050] mb-[15px]">{book.author}</p>
                    
                    <div className="mt-auto flex items-center gap-[8px] text-[0.85rem] text-[#7A6050]">
                      <div className="w-[24px] h-[24px] bg-[#C4843C] rounded-full flex items-center justify-center text-white font-bold text-[10px]">
                        {initial}
                      </div>
                      <span className="truncate">by {book.owner_name}</span>
                    </div>

                    <button 
                      onClick={() => openSwapModal(book.id, book.name)}
                      className="w-full mt-[15px] py-[10px] border border-[#5C3D2E] text-[#5C3D2E] bg-transparent rounded-[8px] font-semibold hover:bg-[#5C3D2E] hover:text-white transition-all"
                    >
                      Request Swap
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* SWAP MODAL - Solid UI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-[20px]">
          <div className="bg-[#FEFCF8] w-full max-w-[450px] rounded-[15px] p-[30px] shadow-[0_10px_40px_rgba(0,0,0,0.3)] animate-modal relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-[15px] right-[20px] text-[1.8rem] text-[#7A6050] hover:text-[#2A1A10]">&times;</button>
            <h3 className="font-serif text-[1.5rem] font-bold text-[#5C3D2E] mb-[10px]">Request a Swap</h3>
            <p className="text-[0.9rem] text-[#7A6050] mb-[20px]">
              You are requesting: <strong className="text-[#2A1A10]">{wantedBook?.title}</strong>
            </p>

            <div className="mb-[20px]">
              <label className="block text-[0.9rem] font-bold text-[#2A1A10] mb-[8px]">Select a book to offer:</label>
              <select 
                value={selectedOffer} onChange={(e) => setSelectedOffer(e.target.value)}
                className="w-full p-[12px] border border-[#ddd] rounded-[8px] font-sans outline-none bg-white focus:border-[#5C3D2E]"
              >
                <option value="">-- Choose a book to offer --</option>
                {myBooks.map(b => (
                  <option key={b.id} value={b.id}>{b.name} (by {b.author})</option>
                ))}
              </select>
            </div>

            {swapError && <p className="text-[#c0392b] text-[0.85rem] font-bold text-center mb-[10px]">{swapError}</p>}

            <button 
              onClick={confirmSwap} disabled={myBooks.length === 0}
              className="w-full bg-[#5C3D2E] text-white py-[12px] rounded-[8px] font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Swap Request
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-[30px] right-[30px] p-[15px_25px] rounded-[8px] shadow-[0_5px_20px_rgba(0,0,0,0.15)] font-sans text-[0.95rem] font-semibold z-[10000] border-l-[5px] bg-[#FEFCF8] text-[#2A1A10] animate-[slideIn_0.3s_ease-out] ${toast.type === 'success' ? 'border-[#5C3D2E]' : 'border-[#c0392b]'}`}>
          {toast.message}
        </div>
      )}
      <Footer />
    </div>
  );
}