import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { adminService } from '@/services/admin.service';
import { useAuthStore } from '@/lib/authStore';

const getSessionId = () => {
  let sid = localStorage.getItem('log_session_id');
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('log_session_id', sid);
  }
  return sid;
};

export default function RouteTracker() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const currentPathRef = useRef<string>(location.pathname);
  const sessionId = getSessionId();

  useEffect(() => {
    if (!isAuthenticated) return;

    if (currentPathRef.current !== location.pathname) {
      adminService.trackActivity({
        sessionId, action: 'LEAVE', entity: 'Page', details: { path: currentPathRef.current }
      }).catch(() => {});
    }

    currentPathRef.current = location.pathname;

    adminService.trackActivity({
      sessionId, action: 'ENTER', entity: 'Page', details: { path: currentPathRef.current }
    }).catch(() => {});
  }, [location.pathname, isAuthenticated, sessionId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      adminService.trackActivity({
        sessionId, action: 'PING', entity: 'Page', details: { path: currentPathRef.current }
      }).catch(() => {});
    }, 5000);

    return () => {
      clearInterval(interval);
      adminService.trackActivity({
        sessionId, action: 'LEAVE', entity: 'Page', details: { path: currentPathRef.current }
      }).catch(() => {});
    };
  }, [isAuthenticated, sessionId]);

  return null;
}
