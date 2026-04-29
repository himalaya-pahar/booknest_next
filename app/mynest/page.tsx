"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserProfile { name: string; email: string; phone_no: string | null; address: string | null; }
interface Book { id: number; name: string; author: string; genre: string; }
interface BookLog { id: number; book_id?: number; }

export default function MyNest() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // STATS STATE
  const [stats, setStats] = useState({ posted: 0, swaps: 0, pending: 0 });
  
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBookIds, setActiveBookIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form States
  const [newBook, setNewBook] = useState({ title: '', author: '', genre: 'Fiction' });
  const [editProfile, setEditProfileData] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push('/signin');
      return;
    }
    setToken(storedToken);
    fetchData(storedToken);
  }, [router]);

  const fetchData = async (currentToken: string) => {
    setLoading(true);
    await Promise.all([ loadProfile(currentToken), loadBookshelfAndStats(currentToken) ]);
    setLoading(false);
  };

  const loadProfile = async (currentToken: string) => {
    try {
      const response = await fetch("https://booknest-backend-fastapi-1.onrender.com/user/", {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditProfileData({ name: data.name, phone: data.phone_no || '', address: data.address || '' });
      }
    } catch (error) { console.error(error); }
  };

  const loadBookshelfAndStats = async (currentToken: string) => {
    try {
      // 1. Fetch Books
      const booksRes = await fetch("https://booknest-backend-fastapi-1.onrender.com/book/", { headers: { Authorization: `Bearer ${currentToken}` } });
      const myBooks: Book[] = booksRes.ok ? await booksRes.json() : [];
      setBooks(myBooks);

      // 2. Fetch Active Logs
      const logsRes = await fetch("https://booknest-backend-fastapi-1.onrender.com/booklog/", { headers: { Authorization: `Bearer ${currentToken}` } });
      const activeLogs: BookLog[] = logsRes.ok ? await logsRes.json() : [];
      const activeIds = activeLogs.map(log => log.book_id || log.id);
      setActiveBookIds(activeIds);

      // 3. MASTER FIX: Use History API for both Pending and Completed Stats
      let pendingCount = 0;
      let completedCount = 0;
      
      try {
        const historyRes = await fetch("https://booknest-backend-fastapi-1.onrender.com/booklog/history/all", { headers: { Authorization: `Bearer ${currentToken}` } });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          // Verify it's an array before counting
          if (Array.isArray(historyData)) {
            // lowercase check just to be 100% safe
            completedCount = historyData.filter((req: any) => req.status.toLowerCase() === 'completed').length;
            pendingCount = historyData.filter((req: any) => req.status.toLowerCase() === 'pending').length;
          }
        }
      } catch (e) {
        console.error("History fetch error for stats", e);
      }

      // 4. Update Stats
      const marketplaceCount = myBooks.filter(b => activeIds.includes(b.id)).length;
      setStats({
        posted: marketplaceCount,
        swaps: completedCount, 
        pending: pendingCount
      });

    } catch (error) { console.error("Failed to load bookshelf", error); }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleListInMarketplace = async (bookId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`https://booknest-backend-fastapi-1.onrender.com/booklog/${bookId}`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast("Book listed in Marketplace", "success");
        loadBookshelfAndStats(token);
      } else showToast("Failed to list book.", "error");
    } catch (error) { showToast("Network error occurred.", "error"); }
  };

  const handleDeleteBook = async () => {
    if (!token || !deleteConfirmId) return;
    try {
      const response = await fetch(`https://booknest-backend-fastapi-1.onrender.com/book/${deleteConfirmId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showToast("Book deleted", "success");
        setDeleteConfirmId(null);
        loadBookshelfAndStats(token);
      } else showToast("Failed to delete book", "error");
    } catch (error) { showToast("Network error", "error"); }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const response = await fetch("https://booknest-backend-fastapi-1.onrender.com/book/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBook.title, author: newBook.author, genre: newBook.genre }),
      });
      if (response.ok) {
        setIsAddModalOpen(false);
        setNewBook({ title: '', author: '', genre: 'Fiction' });
        showToast("Book added", "success");
        loadBookshelfAndStats(token);
      }
    } catch (error) { showToast("Failed to add book.", "error"); }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const response = await fetch("https://booknest-backend-fastapi-1.onrender.com/user/", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: editProfile.name, phone_no: editProfile.phone, address: editProfile.address }),
      });
      if (response.ok) {
        setIsEditModalOpen(false);
        showToast("Profile updated", "success");
        loadProfile(token);
      } else showToast("Failed to update profile.", "error");
    } catch (error) { showToast("Network error updating profile.", "error"); }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink font-sans">
      <Header />
      <main className="flex-grow max-w-[1100px] w-full mx-auto px-5 py-10">
        
        {/* PROFILE CARD - Original Colors, Clean Layout */}
        <div className="bg-warm-white rounded-2xl border border-border p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-12 shadow-sm">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 bg-chocolate rounded-full flex items-center justify-center text-3xl text-parchment font-serif flex-shrink-0">
              {profile ? profile.name.substring(0, 2).toUpperCase() : '..'}
            </div>
            
            <div className="text-center md:text-left mt-2">
              <h1 className="text-2xl font-serif font-bold tracking-tight mb-2 text-ink">{profile ? profile.name : 'Loading...'}</h1>
              <div className="text-sm text-muted space-y-1 mb-5">
                <p>{profile?.email || '...'}</p>
                <p>{profile?.phone_no || 'No phone added'}</p>
                <p>{profile?.address || 'No address added'}</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(true)} 
                className="px-5 py-2 border border-chocolate text-chocolate rounded-full text-xs font-semibold hover:bg-chocolate/5 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="flex gap-6 w-full md:w-auto justify-center md:mt-2">
            <div className="text-center">
              <span className="block text-4xl font-serif font-bold tracking-tighter text-chocolate">{stats.posted}</span>
              <span className="text-[10px] text-muted font-semibold uppercase tracking-widest mt-1 block">Posted</span>
            </div>
            <div className="w-px h-12 bg-border mt-2 hidden sm:block"></div>
            <div className="text-center">
              <span className="block text-4xl font-serif font-bold tracking-tighter text-chocolate">{stats.pending}</span>
              <span className="text-[10px] text-muted font-semibold uppercase tracking-widest mt-1 block">Pending</span>
            </div>
            <div className="w-px h-12 bg-border mt-2 hidden sm:block"></div>
            <div className="text-center">
              <span className="block text-4xl font-serif font-bold tracking-tighter text-chocolate">{stats.swaps}</span>
              <span className="text-[10px] text-muted font-semibold uppercase tracking-widest mt-1 block">Swaps</span>
            </div>
          </div>
        </div>

        {/* INVENTORY SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-xl font-serif font-bold text-ink">Inventory</h2>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="px-6 py-2.5 bg-chocolate text-parchment rounded-full text-sm font-semibold hover:bg-mahogany transition-colors shadow-sm"
          >
            + Post New Book
          </button>
        </div>

        {loading ? (
          <p className="text-center text-muted py-10">Loading inventory...</p>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-warm-white border border-dashed border-border rounded-2xl">
            <p className="text-muted font-medium">Your inventory is empty. Add a book to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map(book => {
              const isActive = activeBookIds.includes(book.id);
              return (
                <div key={book.id} className="bg-warm-white rounded-xl border border-border overflow-hidden flex flex-col group hover:shadow-card transition-all duration-300">
                  <div className="h-[200px] bg-parchment/50 p-4 relative">
                    <span className="absolute top-3 right-3 bg-warm-white/90 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold text-chocolate uppercase tracking-widest border border-border">
                      {book.genre}
                    </span>
                    <img 
                      src={`https://placehold.co/400x600/5c3d2e/f5ecd7?text=${encodeURIComponent(book.name.substring(0,12))}`} 
                      alt="Cover" 
                      className="w-full h-full object-cover rounded shadow-sm group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-serif font-bold text-ink mb-1 truncate" title={book.name}>{book.name}</h3>
                    <p className="text-sm text-muted mb-5 truncate">{book.author}</p>
                    
                    {/* Status Indicator */}
                    <div className="mt-auto mb-5 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-600' : 'bg-amber'}`}></div>
                      <span className="text-xs text-muted font-medium">
                        {isActive ? "Active in Marketplace" : "Private Inventory"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {!isActive ? (
                         <button onClick={() => handleListInMarketplace(book.id)} className="flex-1 py-2 bg-chocolate text-parchment rounded-lg text-xs font-semibold hover:bg-mahogany transition-colors">
                           List
                         </button>
                      ) : (
                        <button disabled className="flex-1 py-2 border border-border text-muted rounded-lg text-xs font-semibold bg-gray-50/50 cursor-not-allowed">
                          Listed
                        </button>
                      )}
                      <button onClick={() => setDeleteConfirmId(book.id)} className="flex-1 py-2 bg-warm-white border border-border text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />

      {/* --- MODALS --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-warm-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-5 right-5 text-muted hover:text-ink text-xl">&times;</button>
            <h3 className="text-2xl font-serif font-bold text-chocolate mb-6">Post New Book</h3>
            <form onSubmit={handleAddBook} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Book Title</label>
                <input type="text" required value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full p-3 border border-border rounded-xl focus:border-chocolate focus:ring-1 focus:ring-chocolate outline-none text-sm transition-all bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Author Name</label>
                <input type="text" required value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="w-full p-3 border border-border rounded-xl focus:border-chocolate focus:ring-1 focus:ring-chocolate outline-none text-sm transition-all bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Genre</label>
                <select required value={newBook.genre} onChange={e => setNewBook({...newBook, genre: e.target.value})} className="w-full p-3 border border-border rounded-xl focus:border-chocolate focus:ring-1 focus:ring-chocolate outline-none text-sm bg-white cursor-pointer transition-all">
                  <option value="Fiction">Fiction</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Academic">Academic</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-chocolate text-parchment py-3.5 rounded-xl text-sm font-semibold mt-2 hover:bg-mahogany transition-colors shadow-sm">Add to Inventory</button>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-warm-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-5 right-5 text-muted hover:text-ink text-xl">&times;</button>
            <h3 className="text-2xl font-serif font-bold text-chocolate mb-6">Edit Profile</h3>
            <form onSubmit={handleEditProfile} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" required value={editProfile.name} onChange={e => setEditProfileData({...editProfile, name: e.target.value})} className="w-full p-3 border border-border rounded-xl focus:border-chocolate focus:ring-1 focus:ring-chocolate outline-none text-sm transition-all bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Phone Number</label>
                <input type="text" value={editProfile.phone} onChange={e => setEditProfileData({...editProfile, phone: e.target.value})} className="w-full p-3 border border-border rounded-xl focus:border-chocolate focus:ring-1 focus:ring-chocolate outline-none text-sm transition-all bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Address</label>
                <input type="text" value={editProfile.address} onChange={e => setEditProfileData({...editProfile, address: e.target.value})} className="w-full p-3 border border-border rounded-xl focus:border-chocolate focus:ring-1 focus:ring-chocolate outline-none text-sm transition-all bg-white" />
              </div>
              <button type="submit" className="w-full bg-chocolate text-parchment py-3.5 rounded-xl text-sm font-semibold mt-2 hover:bg-mahogany transition-colors shadow-sm">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-warm-white w-full max-w-sm rounded-2xl p-8 shadow-2xl text-center relative border border-border">
            <h3 className="text-xl font-serif font-bold text-ink mb-2">Delete Book</h3>
            <p className="text-muted text-sm mb-8">Are you sure you want to delete this book? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 bg-white border border-border text-ink rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleDeleteBook} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg font-sans text-sm font-semibold animate-[fadeUp_0.3s_ease-out] z-[200] border ${toast.type === 'success' ? 'bg-warm-white text-ink border-green-600' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}