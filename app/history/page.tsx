"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface SwapRequest {
  id: number; date: string; role: 'owner' | 'requestor';
  wanted_book_title: string; offered_book_title: string;
  other_person_name: string; status: string;
  grantor_confirmed?: boolean; requestor_confirmed?: boolean;
  other_person_contact: { phone: string; address: string; };
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
    if (!storedToken) { router.push('/signin'); return; }
    setToken(storedToken);
    loadHistory(storedToken);
  }, [router]);

  const loadHistory = async (currentToken: string) => {
    setLoading(true);
    try {
      const response = await fetch("https://booknest-backend-fastapi-1.onrender.com/booklog/history/all", { headers: { Authorization: `Bearer ${currentToken}` } });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setOngoing(data.filter(req => req.status !== "completed" && req.status !== "rejected"));
          setCompleted(data.filter(req => req.status === "completed"));
        }
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const updateRequestStatus = async (id: number, status: string) => {
    if (!token) return;
    try {
      const response = await fetch(`https://booknest-backend-fastapi-1.onrender.com/booklog/request/${id}?upd=${status}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) { setIsModalOpen(false); loadHistory(token); } 
      else alert("Action failed. Try again.");
    } catch (error) { alert("Network error."); }
  };

  const openContactModal = (req: SwapRequest) => {
    const hasIConfirmed = (req.role === "owner" && req.grantor_confirmed) || (req.role === "requestor" && req.requestor_confirmed);
    setActiveReq({
      id: req.id, name: req.other_person_name,
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
      
      <main className="flex-grow max-w-[1100px] w-full mx-auto px-[20px] py-[40px]">
        
        {/* Ongoing */}
        <h2 className="font-serif text-[1.8rem] font-bold mb-[5px]">Ongoing Requests</h2>
        <p className="text-[0.9rem] text-[#7A6050] mb-[20px]">
          Accept a request to see contact info. Meet up and click "Confirm Swap" once physical exchange is done.
        </p>

        <div className="overflow-x-auto bg-[#FEFCF8] rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] mb-[60px] border border-black/5">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#5C3D2E] text-white">
                <th className="p-[15px] font-semibold">Role</th>
                <th className="p-[15px] font-semibold">Book Given</th>
                <th className="p-[15px] font-semibold">Book Received</th>
                <th className="p-[15px] font-semibold">Person</th>
                <th className="p-[15px] font-semibold">Status</th>
                <th className="p-[15px] font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-[15px] text-center text-[#7A6050]">Loading...</td></tr>
              ) : ongoing.length === 0 ? (
                <tr><td colSpan={6} className="p-[15px] text-center text-[#7A6050]">No ongoing requests.</td></tr>
              ) : (
                ongoing.map(req => (
                  <tr key={req.id} className="border-b border-[#eee] hover:bg-[#FDF8F0] transition-colors">
                    <td className="p-[15px] text-[0.85rem] font-bold uppercase text-[#7A6050]">{req.role}</td>
                    <td className="p-[15px]">{req.role === "owner" ? req.wanted_book_title : req.offered_book_title}</td>
                    <td className="p-[15px]">{req.role === "owner" ? req.offered_book_title : req.wanted_book_title}</td>
                    <td className="p-[15px]">{req.other_person_name}</td>
                    <td className="p-[15px] font-bold text-[#f39c12]">{req.status.toUpperCase()}</td>
                    <td className="p-[15px]">
                      {req.status === "pending" && req.role === "owner" && (
                        <div className="flex gap-[5px]">
                          <button onClick={() => updateRequestStatus(req.id, 'accepted')} className="px-[15px] py-[5px] bg-[#5C3D2E] text-white text-[0.8rem] rounded-[50px] font-semibold">Accept</button>
                          <button onClick={() => updateRequestStatus(req.id, 'rejected')} className="px-[15px] py-[5px] bg-[#c0392b] text-white text-[0.8rem] rounded-[50px] font-semibold">Reject</button>
                        </div>
                      )}
                      {req.status === "pending" && req.role === "requestor" && (
                        <span className="text-[0.85rem] font-bold text-[#f39c12]">Waiting for Owner</span>
                      )}
                      {req.status === "accepted" && (
                        <button onClick={() => openContactModal(req)} className="px-[15px] py-[5px] border-2 border-[#5C3D2E] text-[#5C3D2E] text-[0.8rem] rounded-[50px] font-semibold hover:bg-[#5C3D2E] hover:text-white transition-colors">
                          {((req.role === "owner" && req.grantor_confirmed) || (req.role === "requestor" && req.requestor_confirmed)) ? "View Contact" : "Connect & Confirm"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Completed */}
        <h2 className="font-serif text-[1.8rem] font-bold mb-[20px]">Successful Swaps</h2>
        <div className="overflow-x-auto bg-[#FEFCF8] rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-black/5">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#5C3D2E] text-white">
                <th className="p-[15px] font-semibold">Date</th>
                <th className="p-[15px] font-semibold">Book Given</th>
                <th className="p-[15px] font-semibold">Book Received</th>
                <th className="p-[15px] font-semibold">Swapped With</th>
                <th className="p-[15px] font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-[15px] text-center text-[#7A6050]">Loading...</td></tr>
              ) : completed.length === 0 ? (
                <tr><td colSpan={5} className="p-[15px] text-center text-[#7A6050]">No completed swaps yet.</td></tr>
              ) : (
                completed.map(req => (
                  <tr key={req.id} className="border-b border-[#eee]">
                    <td className="p-[15px] text-[0.9rem] text-[#7A6050]">{new Date(req.date).toLocaleDateString()}</td>
                    <td className="p-[15px]">{req.role === "owner" ? req.wanted_book_title : req.offered_book_title}</td>
                    <td className="p-[15px]">{req.role === "owner" ? req.offered_book_title : req.wanted_book_title}</td>
                    <td className="p-[15px]">{req.other_person_name}</td>
                    <td className="p-[15px] font-bold text-[#27ae60]">Completed</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* CONTACT MODAL */}
      {isModalOpen && activeReq && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-[20px]">
          <div className="bg-[#FEFCF8] w-full max-w-[400px] rounded-[15px] p-[35px] text-center relative shadow-[0_10px_30px_rgba(0,0,0,0.3)] animate-modal">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-[10px] right-[20px] text-[1.8rem] text-[#7A6050] hover:text-[#2A1A10]">&times;</button>
            <h3 className="font-serif text-[1.5rem] font-bold text-[#5C3D2E] mb-[15px]">Contact Info</h3>
            
            <p className="text-[0.95rem] mb-[5px]"><strong>Phone:</strong> {activeReq.phone}</p>
            <p className="text-[0.95rem] mb-[20px]"><strong>Address:</strong> {activeReq.address}</p>

            <div className="bg-[#fff9e6] border border-[#ffe58f] p-[15px] rounded-[8px] mb-[20px] text-[0.85rem] text-[#856404] text-left">
              <strong>Step 2: Physical Meeting</strong><br />
              Meet the user. Once you have the book in your hand, click the button below.
            </div>

            <button 
              onClick={() => updateRequestStatus(activeReq.id, 'completed')}
              disabled={activeReq.hasConfirmed}
              className="w-full bg-[#5C3D2E] text-white py-[10px] rounded-[50px] font-semibold hover:-translate-y-0.5 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeReq.hasConfirmed ? "Waiting for other person..." : "I have received my book"}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}