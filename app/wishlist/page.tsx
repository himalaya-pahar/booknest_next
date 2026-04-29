"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface WishlistBook { id: number; title: string; author: string; condition: string; }

export default function Wishlist() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [books, setBooks] = useState<WishlistBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [newBook, setNewBook] = useState({ title: '', author: '', condition: 'Any Condition' });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) { router.push('/signin'); return; }
    setToken(storedToken);
    loadWishlistBooks(storedToken);
  }, [router]);

  const loadWishlistBooks = async (currentToken: string) => {
    setLoading(true);
    try {
      const response = await fetch("https://booknest-backend-fastapi-1.onrender.com/wishlist/", { headers: { Authorization: `Bearer ${currentToken}` } });
      if (response.ok) {
        const data = await response.json();
        setBooks(Array.isArray(data) ? data : []);
      } else if (response.status === 401) router.push('/signin');
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const response = await fetch("https://booknest-backend-fastapi-1.onrender.com/wishlist/", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newBook)
      });
      if (response.ok) {
        setNewBook({ title: '', author: '', condition: 'Any Condition' });
        setToast({ message: "Book added to wishlist!", type: "success" });
        loadWishlistBooks(token);
        setTimeout(() => setToast(null), 3000);
      } else setToast({ message: "Failed to add book.", type: "error" });
    } catch (error) { setToast({ message: "Network error occurred.", type: "error" }); }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F0] font-sans text-[#2A1A10]">
      <Header />
      <main className="flex-grow max-w-[1100px] w-full mx-auto px-[20px] py-[40px]">
        
        <h2 className="font-serif text-[1.8rem] font-bold mb-[25px]">Books I Want</h2>

        {/* Add Section */}
        <div className="bg-[#f4f4f9] p-[20px] rounded-[8px] mb-[30px]">
          <h3 className="font-serif text-[1.2rem] font-bold text-[#2A1A10] mb-[10px]">Add New Book to Wishlist</h3>
          <form onSubmit={handleAddBook} className="flex flex-wrap gap-[10px]">
            <input type="text" required placeholder="Book Title" value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} className="flex-1 min-w-[200px] p-[10px] border border-[#ccc] rounded-[4px] outline-none focus:border-[#5C3D2E]" />
            <input type="text" required placeholder="Author" value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} className="flex-1 min-w-[200px] p-[10px] border border-[#ccc] rounded-[4px] outline-none focus:border-[#5C3D2E]" />
            <select value={newBook.condition} onChange={(e) => setNewBook({...newBook, condition: e.target.value})} className="flex-1 min-w-[150px] p-[10px] border border-[#ccc] rounded-[4px] outline-none bg-white">
              <option value="Any Condition">Any Condition</option>
              <option value="Good Condition">Good Condition</option>
              <option value="Like New">Like New</option>
            </select>
            <button type="submit" className="bg-[#333] text-white px-[20px] py-[10px] rounded-[4px] font-semibold hover:bg-black transition-colors">Add Book</button>
          </form>
        </div>

        {/* Grid Section */}
        {loading ? (
          <p className="text-center text-[#7A6050] w-full">Loading wishlist...</p>
        ) : books.length === 0 ? (
          <p className="text-center text-[#7A6050] w-full py-[40px]">Your wishlist is empty. Add some books!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[20px]">
            {books.map(book => (
              <div key={book.id} className="bg-[#FEFCF8] rounded-[10px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all flex flex-col group border border-black/5">
                <div className="h-[180px] bg-[#f0f0f0] relative">
                  <span className="absolute top-[10px] right-[10px] bg-white/95 px-[10px] py-[4px] rounded-[12px] text-[0.75rem] font-bold text-[#5C3D2E]">
                    {book.condition}
                  </span>
                  <img src={`https://placehold.co/200x300/444/FFF?text=${encodeURIComponent(book.title.substring(0,10))}`} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-[12px] flex flex-col flex-grow">
                  <h3 className="font-serif text-[1rem] font-bold mb-[2px] truncate">{book.title}</h3>
                  <p className="text-[0.8rem] text-[#7A6050] mb-[15px]">{book.author}</p>
                  <button className="mt-auto w-full py-[8px] border border-[#999] text-[#666] bg-transparent rounded-[8px] text-[0.8rem] font-semibold hover:bg-gray-100 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {toast && (
        <div className={`fixed bottom-[30px] right-[30px] p-[15px_25px] rounded-[8px] shadow-[0_5px_20px_rgba(0,0,0,0.15)] font-sans text-[0.95rem] font-semibold z-[10000] border-l-[5px] bg-[#FEFCF8] text-[#2A1A10] animate-[slideIn_0.3s_ease-out] ${toast.type === 'success' ? 'border-[#5C3D2E]' : 'border-[#c0392b]'}`}>
          {toast.message}
        </div>
      )}
      <Footer />
    </div>
  );
}