"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface SwapRequest {
  id: number;
  date: string;
  role: 'owner' | 'requestor';
  wanted_book_title: string;
  offered_book_title: string;
  other_person_name: string;
  status: string;
  grantor_confirmed?: boolean;
  requestor_confirmed?: boolean;
  other_person_contact: {
    phone: string;
    address: string;
  };
}

export default function History() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [ongoing, setOngoing] = useState<SwapRequest[]>([]);
  const [completed, setCompleted] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeReq, setActiveReq] = useState<{ id: number; name: string; phone: string; address: string; hasConfirmed: boolean } | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push('/signin');
      return;
    }
    setToken(storedToken);
    loadHistory(storedToken);
  }, [router]);

  const loadHistory = async (currentToken: string) => {
    setLoading(true);
    try {
      const response = await fetch("https://booknest-backend-fastapi-1.onrender.com/booklog/history/all", {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      if (response.ok) {
        const data: SwapRequest[] = await response.json();
        if (Array.isArray(data)) {
          setOngoing(data.filter(req => req.status !== "completed" && req.status !== "rejected"));
          setCompleted(data.filter(req => req.status === "completed"));
        }
      }
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: number, status: string) => {
    if (!token) return;
    try {
      const response = await fetch(`https://booknest-backend-fastapi-1.onrender.com/booklog/request/${id}?upd=${status}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        loadHistory(token);
      }
    } catch (error) {
      console.error("Network error.");
    }
  };

  const openContactModal = (req: SwapRequest) => {
    const hasIConfirmed = (req.role === "owner" && req.grantor_confirmed) || (req.role === "requestor" && req.requestor_confirmed);
    
    setActiveReq({
      id: req.id,
      name: req.other_person_name,
      phone: req.other_person_contact?.phone || 'Not provided',
      address: req.other_person_contact?.address || 'Not provided',
      hasConfirmed: !!hasIConfirmed
    });
    setIsModalOpen(true);
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F0] font-sans text-[#2A1A10]">
      <Header />
      
      <main className="flex-grow max-w-[1100px] w-full mx-auto px-5 py-12 md:py-16">
        
        {/* Page Heading */}
        <div className="mb-12 border-l-4 border-[#5C3D2E] pl-5">
          <h1 className="font-serif text-3xl md:text-4xl font-bold">Swap History</h1>
          <p className="text-[#7A6050] mt-1 text-sm md:text-base">Manage your active requests and review past successful exchanges.</p>
        </div>
        
        {/* --- ONGOING REQUESTS --- */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
            Ongoing Requests
            {ongoing.length > 0 && <span className="bg-[#5C3D2E] text-white text-[10px] px-2 py-0.5 rounded-full">{ongoing.length}</span>}
          </h2>

          {/* Desktop Table */}
          <div className="hidden md:block bg-[#FEFCF8] rounded-xl border border-black/5 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#5C3D2E] text-white text-[11px] uppercase tracking-[1.5px] font-bold">
                  <th className="p-5">Role</th>
                  <th className="p-5">Book Given</th>
                  <th className="p-5">Book Received</th>
                  <th className="p-5">Partner</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Loading...</td></tr>
                ) : ongoing.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-gray-400 italic">No ongoing requests found.</td></tr>
                ) : (
                  ongoing.map(req => (
                    <tr key={req.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="p-5"><span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase">{req.role}</span></td>
                      <td className="p-5 text-sm font-semibold">{req.role === "owner" ? req.wanted_book_title : req.offered_book_title}</td>
                      <td className="p-5 text-sm font-semibold">{req.role === "owner" ? req.offered_book_title : req.wanted_book_title}</td>
                      <td className="p-5 text-sm text-[#7A6050]">{req.other_person_name}</td>
                      <td className="p-5"><span className="text-xs font-bold text-amber-600">{req.status.toUpperCase()}</span></td>
                      <td className="p-5 text-right">
                        {req.status === "pending" && req.role === "owner" && (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => updateRequestStatus(req.id, 'accepted')} className="px-4 py-1.5 bg-[#5C3D2E] text-white text-xs rounded-lg font-bold hover:bg-[#8B5E3C]">Accept</button>
                            <button onClick={() => updateRequestStatus(req.id, 'rejected')} className="px-4 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg font-bold hover:bg-red-100">Reject</button>
                          </div>
                        )}
                        {req.status === "accepted" && (
                          <button onClick={() => openContactModal(req)} className="px-4 py-1.5 border border-[#5C3D2E] text-[#5C3D2E] text-xs rounded-lg font-bold hover:bg-[#5C3D2E] hover:text-white transition-all">Connect & Confirm</button>
                        )}
                        {req.status === "pending" && req.role === "requestor" && <span className="text-xs text-gray-400 italic">Waiting...</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {ongoing.map(req => (
              <div key={req.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase tracking-widest">{req.role}</span>
                  <span className="text-[11px] font-black text-amber-600 tracking-wider">{req.status.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-gray-50">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Give</p>
                    <p className="text-xs font-bold">{req.role === "owner" ? req.wanted_book_title : req.offered_book_title}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Receive</p>
                    <p className="text-xs font-bold">{req.role === "owner" ? req.offered_book_title : req.wanted_book_title}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                   <p className="text-xs text-gray-500">With <span className="font-bold text-black">{req.other_person_name}</span></p>
                   {req.status === "pending" && req.role === "owner" && (
                    <div className="flex gap-2">
                      <button onClick={() => updateRequestStatus(req.id, 'accepted')} className="px-3 py-1.5 bg-[#5C3D2E] text-white text-[10px] rounded-lg font-bold">Accept</button>
                      <button onClick={() => updateRequestStatus(req.id, 'rejected')} className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] rounded-lg font-bold">Reject</button>
                    </div>
                  )}
                  {req.status === "accepted" && (
                    <button onClick={() => openContactModal(req)} className="px-4 py-2 border border-[#5C3D2E] text-[#5C3D2E] text-[10px] rounded-lg font-black">Confirm Meetup</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- SUCCESSFUL SWAPS --- */}
        <section>
          <h2 className="font-serif text-2xl font-bold mb-6">Successful Swaps</h2>
          
          <div className="hidden md:block bg-[#FEFCF8] rounded-xl border border-black/5 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-[1.5px] font-bold text-gray-500">
                  <th className="p-5">Date</th>
                  <th className="p-5">Give</th>
                  <th className="p-5">Receive</th>
                  <th className="p-5">Swapped With</th>
                  <th className="p-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {completed.map(req => (
                  <tr key={req.id} className="text-sm">
                    <td className="p-5 text-gray-400">{new Date(req.date).toLocaleDateString()}</td>
                    <td className="p-5 font-medium">{req.role === "owner" ? req.wanted_book_title : req.offered_book_title}</td>
                    <td className="p-5 font-medium">{req.role === "owner" ? req.offered_book_title : req.wanted_book_title}</td>
                    <td className="p-5">{req.other_person_name}</td>
                    <td className="p-5 text-right font-bold text-green-600">Completed</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile completed cards */}
          <div className="md:hidden space-y-3">
            {completed.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-xl border border-black/5 flex justify-between items-center">
                <div className="space-y-1">
                   <p className="text-[10px] text-gray-400">{new Date(req.date).toLocaleDateString()}</p>
                   <p className="text-xs font-bold">{req.wanted_book_title} ↔ {req.offered_book_title}</p>
                </div>
                <span className="text-[10px] font-bold text-green-600 tracking-tighter uppercase italic">Success</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* --- REFINED CONTACT MODAL --- */}
      {isModalOpen && activeReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-5">
          <div className="bg-[#FEFCF8] w-full max-w-sm rounded-[24px] p-8 shadow-2xl animate-modal relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-6 text-2xl text-gray-300 hover:text-black">&times;</button>
            
            <div className="w-16 h-16 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-2xl mx-auto mb-5">🤝</div>
            <h3 className="font-serif text-2xl font-bold mb-2">Connect & Swap</h3>
            <p className="text-[#7A6050] text-sm mb-6">Reach out to <span className="text-black font-bold">{activeReq.name}</span> to arrange a time.</p>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 text-left mb-6 shadow-sm">
               <div>
                  <label className="text-[9px] font-bold uppercase text-gray-400 block mb-1">Mobile</label>
                  <p className="text-sm font-mono font-bold tracking-tight">{activeReq.phone}</p>
               </div>
               <div>
                  <label className="text-[9px] font-bold uppercase text-gray-400 block mb-1">Meetup Location</label>
                  <p className="text-sm font-medium">{activeReq.address}</p>
               </div>
            </div>

            <button 
              onClick={() => updateRequestStatus(activeReq.id, 'completed')}
              disabled={activeReq.hasConfirmed}
              className="w-full bg-[#5C3D2E] text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeReq.hasConfirmed ? "Waiting for Partner..." : "Confirm Physical Exchange"}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}