"use client";

import { useState, useEffect } from "react";
import { Bell, Send, Loader2, RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Pagination, Table, TableHeader, TableBody, Tr, Th, Td } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import api from "@/lib/api";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ userId: "all", title: "", message: "" });
  const [users, setUsers] = useState<any[]>([]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/notifications?page=${page}&limit=10`);
      setNotifications(res.data.data.data);
      setTotalPages(Math.ceil(res.data.data.total / res.data.data.limit));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/customers?limit=100');
      setUsers(res.data.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/admin/notifications', formData);
      setSendModalOpen(false);
      setFormData({ userId: "all", title: "", message: "" });
      fetchNotifications();
    } catch (err) {
      alert("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <SetAdminHeader 
        title="Notifications" 
        subtitle="Manage and send notifications to your clients"
        action={
          <button onClick={() => setSendModalOpen(true)} className="btn-primary">
            <Send size={16} /> Send Notification
          </button>
        }
      />

      <div className="flex flex-col gap-2">
        <Table>
          <TableHeader>
            <Tr>
              <Th>Sent Date</Th>
              <Th>Client</Th>
              <Th>Title</Th>
              <Th>Message</Th>
              <Th>Status</Th>
            </Tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <Tr><Td colSpan={5} className="text-center py-8 text-slate-500">Loading notifications...</Td></Tr>
            ) : notifications.length === 0 ? (
              <Tr><Td colSpan={5}>
                <EmptyState icon={<Bell size={24} />} title="No notifications sent yet" />
              </Td></Tr>
            ) : notifications.map((notif) => (
              <Tr key={notif.id}>
                <Td className="text-xs text-slate-500">{formatDateTime(notif.createdAt)}</Td>
                <Td>
                  {notif.user ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                        {notif.user.name[0]}
                      </div>
                      <span className="font-medium text-slate-900">{notif.user.name}</span>
                    </div>
                  ) : (
                    <span className="badge-purple">All Clients</span>
                  )}
                </Td>
                <Td className="font-semibold text-slate-900">{notif.title}</Td>
                <Td>
                  <p className="text-sm text-slate-600 truncate max-w-md" title={notif.message}>
                    {notif.message}
                  </p>
                </Td>
                <Td><span className="badge-green">Sent</span></Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={sendModalOpen} onClose={() => setSendModalOpen(false)} title="Send Notification" size="md">
        <form onSubmit={handleSendNotification} className="space-y-4 p-2">
          <div>
            <label className="label">Select Client</label>
            <select
              className="input"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              required
            >
              <option value="all">All Clients (Broadcast)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Notification Title</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. System Maintenance"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              className="input h-32 py-3"
              placeholder="Type your message here..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            ></textarea>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setSendModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={sending} className="btn-primary flex-1 justify-center">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sending ? 'Sending...' : 'Send Now'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
