"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import { Loader2, Headphones, Search, CheckCircle2, Clock, XCircle, AlertCircle, Eye } from "lucide-react";
import { EmptyState, Pagination, Table, TableHeader, TableBody, Tr, Th, Td, FilterBar } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const fetchTickets = () => {
    setLoading(true);
    adminService.getSupportTickets()
      .then((res) => setTickets(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await adminService.updateSupportTicketStatus(id, status);
      fetchTickets();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1 w-max"><Clock size={12}/> Pending</span>;
      case "IN_PROGRESS": return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1 w-max"><AlertCircle size={12}/> In Progress</span>;
      case "RESOLVED": return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center gap-1 w-max"><CheckCircle2 size={12}/> Resolved</span>;
      case "REJECTED": return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center gap-1 w-max"><XCircle size={12}/> Rejected</span>;
      default: return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-50 text-gray-600 border border-gray-200 w-max">{status}</span>;
    }
  };

  const filteredTickets = tickets.filter(t => 
    (t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (statusFilter === "" || t.status === statusFilter)
  );

  const perPage = 10;
  const paged = filteredTickets.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4 animate-fade-in">
      <SetAdminHeader
        title="Support Tickets"
        subtitle="Manage and respond to customer support requests."
        filter={
          <FilterBar
            search={searchQuery}
            onSearchChange={(val) => { setSearchQuery(val); setPage(1); }}
            searchPlaceholder="Search tickets by subject or email..."
            filters={[
              {
                value: statusFilter,
                onChange: (val) => { setStatusFilter(val); setPage(1); },
                placeholder: "All Status",
                options: [
                  { label: "All Status", value: "" },
                  { label: "Pending", value: "PENDING" },
                  { label: "In Progress", value: "IN_PROGRESS" },
                  { label: "Resolved", value: "RESOLVED" },
                  { label: "Rejected", value: "REJECTED" },
                ]
              }
            ]}
          />
        }
      />

      {/* Table */}
      <div className="flex flex-col gap-2">
        <Table>
          <TableHeader>
            <Tr>
              <Th>Subject</Th>
              <Th>Phone Number</Th>
              <Th>Date Submitted</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <Tr><Td colSpan={5} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-indigo-600" /></Td></Tr>
            ) : paged.length === 0 ? (
              <Tr>
                <Td colSpan={5}>
                  <EmptyState
                    icon={<Headphones size={24} />}
                    title="No tickets found"
                    description="No support tickets match your search or filters."
                  />
                </Td>
              </Tr>
            ) : (
              paged.map((ticket) => (
                <Tr key={ticket.id}>
                  <Td className="max-w-xs">
                    <div className="font-bold text-gray-900 truncate">{ticket.subject}</div>
                  </Td>
                  <Td>
                    <div className="text-sm font-medium text-gray-900">{ticket.phone || '—'}</div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {getStatusBadge(ticket.status)}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <select
                        disabled={updatingId === ticket.id}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500 disabled:opacity-50 font-medium"
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </TableBody>
        </Table>
        <div className="px-4 py-3 border-t border-slate-100">
          <Pagination
            page={page}
            totalPages={Math.ceil(filteredTickets.length / perPage) || 1}
            onPageChange={setPage}
          />
        </div>
      </div>

      <Modal 
        isOpen={!!selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
        title="Support Ticket Details"
        size="md"
      >
        {selectedTicket && (
          <div className="space-y-6">
            <div>
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Subject</h4>
              <p className="text-sm font-semibold text-gray-900">{selectedTicket.subject}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Customer Name</h4>
                <p className="text-sm text-gray-800">{selectedTicket.name || selectedTicket.user?.name || 'Guest User'}</p>
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</h4>
                <p className="text-sm text-gray-800">{selectedTicket.phone || '—'}</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</h4>
                <p className="text-sm text-gray-800">{selectedTicket.email || selectedTicket.user?.email || '—'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Message</h4>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                {selectedTicket.message}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button onClick={() => setSelectedTicket(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
