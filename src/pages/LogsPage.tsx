import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import { useAdminHeader } from "@/lib/adminHeaderContext";
import { Search, Activity, Clock, MapPin, Loader2, Store, User, Hash, Radio } from "lucide-react";
import { Table, TableHeader, TableBody, Tr, Th, Td } from "@/components/ui/Table";
import { cn } from "@/lib/utils";

export default function LogsPage() {
  const { setHeader } = useAdminHeader();
  const [activeTab, setActiveTab] = useState<"live" | "history">("live");

  const [logs, setLogs] = useState<any[]>([]);
  const [activeLogs, setActiveLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setHeader({
      title: "Activity Logs",
      subtitle: "Track live presence and historical activities across the platform",
    });
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory(page);
    } else {
      fetchActive();
      const interval = setInterval(fetchActive, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, page]);

  const fetchHistory = async (p: number) => {
    setLoading(true);
    try {
      const res = await adminService.getLogs({ page: p, limit: 50 });
      setLogs(res.data.data.data);
      setTotal(res.data.data.total);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActive = async () => {
    setLoading(true);
    try {
      const res = await adminService.getActiveLogs();
      setActiveLogs(res.data.data);
      setTotal(res.data.data.length);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    if (action === "PAGE_VIEW") return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">Page View</span>;
    if (action.includes("CREATE")) return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">{action}</span>;
    if (action.includes("UPDATE")) return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">{action}</span>;
    if (action.includes("DELETE")) return <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">{action}</span>;
    return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">{action}</span>;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto animate-fade-in">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            {activeTab === "live" ? <Radio size={24} className="animate-pulse text-emerald-500" /> : <Activity size={24} />}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{activeTab === "live" ? "Active Now" : "Total Logs"}</p>
            <h3 className="text-2xl font-bold text-slate-900">{total}</h3>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 flex items-center gap-4 px-4 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("live")}
            className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-colors", activeTab === "live" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
          >
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", activeTab === "live" ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
              Live Active
            </div>
          </button>
          <button
            onClick={() => { setActiveTab("history"); setPage(1); }}
            className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-colors", activeTab === "history" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
          >
            History
          </button>
        </div>

        {activeTab === "live" && (
          <Table>
            <TableHeader>
              <Tr>
                <Th>Started At</Th>
                <Th>Tenant / Store</Th>
                <Th>Current Page</Th>
                <Th>Visits</Th>
                <Th>Live Duration</Th>
              </Tr>
            </TableHeader>
            <TableBody>
              {loading && activeLogs.length === 0 ? (
                <Tr><Td colSpan={5} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-slate-400" size={16} /></Td></Tr>
              ) : activeLogs.length === 0 ? (
                <Tr><Td colSpan={5} className="text-center py-8 text-slate-500">No active users right now.</Td></Tr>
              ) : (
                activeLogs.map((log) => (
                  <Tr key={log.id}>
                    <Td>
                      <div className="text-[11px] text-slate-500">{formatTime(log.createdAt)}</div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Store size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-800 text-sm">{log.tenant?.name || "System"}</span>
                      </div>
                    </Td>
                    <Td>
                      <div className="text-xs text-slate-600 flex items-center gap-1 font-mono bg-slate-100 px-2 py-1 rounded w-fit">
                        <MapPin size={12} /> {log.path}
                      </div>
                    </Td>
                    <Td>
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">{log.visits}</span>
                    </Td>
                    <Td>
                      <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                        <Clock size={14} className="animate-pulse" /> {formatDuration(log.duration)}
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {activeTab === "history" && (
          <>
            <Table>
              <TableHeader>
                <Tr>
                  <Th>Date & Time</Th>
                  <Th>Tenant / Store</Th>
                  <Th>User</Th>
                  <Th>Action</Th>
                  <Th>Details</Th>
                </Tr>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <Tr><Td colSpan={5} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-slate-400" size={16} /></Td></Tr>
                ) : logs.length === 0 ? (
                  <Tr><Td colSpan={5} className="text-center py-8 text-slate-500">No history found.</Td></Tr>
                ) : (
                  logs.map((log) => (
                    <Tr key={log.id}>
                      <Td>
                        <div className="text-sm font-medium text-slate-900">{formatDate(log.createdAt)}</div>
                        <div className="text-[11px] text-slate-500">{formatTime(log.createdAt)}</div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <Store size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-800 text-sm">{log.tenant?.name || "System"}</span>
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <span className="text-slate-700 text-sm">{log.user?.name || "Anonymous"}</span>
                        </div>
                      </Td>
                      <Td>{getActionBadge(log.action)}</Td>
                      <Td>
                        <div className="flex flex-col gap-1">
                          {log.entity && (
                            <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              <Hash size={12} /> {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 6)})` : ""}
                            </div>
                          )}
                          {log.details?.path && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin size={12} /> {log.details.path}
                            </div>
                          )}
                          {log.details?.duration && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={12} /> {formatDuration(log.details.duration)}
                            </div>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Showing {logs.length} of {total} logs</p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors">Previous</button>
                <button disabled={logs.length < 50} onClick={() => setPage(page + 1)} className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
