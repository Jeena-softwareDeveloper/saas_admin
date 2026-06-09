import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IndianRupee, Loader2, Trash2, X } from "lucide-react";
import { adminService } from "../../services/admin.service";

interface PaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

export const ClientPaymentsDrawer: React.FC<PaymentDrawerProps> = ({ isOpen, onClose, user, onSuccess }) => {
  const [mounted, setMounted] = useState(false);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      document.body.style.overflow = "hidden";
      fetchPayments(user);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, user]);

  const fetchPayments = async (currentUser: any) => {
    try {
      const res = await adminService.getClientPayments(currentUser.id);
      setPaymentsList(res.data.data || []);
      
      let baseDate = new Date(currentUser.createdAt);
      if (res.data.data && res.data.data.length > 0) {
        baseDate = new Date(res.data.data[0].paymentDate);
      }
      baseDate.setMonth(baseDate.getMonth() + 1);
      setPaymentDate(baseDate.toISOString().split('T')[0]);
      
      setPaymentAmount(currentUser.tenant?.monthlyFee?.toString() || "");
      setPaymentNotes("");
    } catch (err: any) {
      console.error("Failed to load payments", err);
    }
  };

  const handleSave = async () => {
    try {
      setPaymentLoading(true);
      const res = await adminService.addClientPayment(user.id, {
        amount: paymentAmount,
        paymentDate,
        notes: paymentNotes
      });
      if (res.data.success) {
        onSuccess();
        fetchPayments(user);
      }
    } catch (err: any) {
      alert("Failed to add payment: " + (err.response?.data?.message || err.message));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    try {
      await adminService.deleteClientPayment(user.id, paymentId);
      onSuccess();
      fetchPayments(user);
    } catch (err) {
      alert("Failed to delete payment");
    }
  };

  if (!isOpen || !mounted || !user) return null;

  const drawerContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <IndianRupee className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Client Payments</h3>
              <p className="text-sm text-slate-500">{user.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
          
          {/* Add New Payment Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-semibold text-slate-800">Add New Payment Entry</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Amount (₹)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="e.g. 500"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Next Payment Date</label>
                <div className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm text-slate-600 font-medium flex items-center">
                  {paymentDate ? new Date(paymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Notes (Optional)</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                placeholder="e.g. Monthly server fee for July"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>

            <button
              disabled={!paymentAmount || !paymentDate || paymentLoading}
              onClick={handleSave}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {paymentLoading && <Loader2 size={16} className="animate-spin" />}
              Save Payment Entry
            </button>
          </div>

          {/* Payment History */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center justify-between">
              Payment History
              <span className="text-xs font-medium text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{paymentsList.length}</span>
            </h4>
            {paymentsList.length === 0 ? (
              <div className="text-center py-10 bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <IndianRupee className="text-slate-300" size={24} />
                </div>
                <p className="text-sm text-slate-600 font-medium">No payments recorded</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Add your first payment entry above to start tracking.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentsList.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white shadow-sm group">
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1 text-base">
                        <span className="text-slate-400 font-medium text-sm">₹</span>{payment.amount}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        {new Date(payment.paymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {payment.notes && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-slate-500 truncate max-w-[150px]">{payment.notes}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(payment.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Payment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};
