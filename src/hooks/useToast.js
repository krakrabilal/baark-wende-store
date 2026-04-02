// src/hooks/useToast.js
import { useState } from "react";

export function useToast() {
  const [toast, setToast] = useState({ show: false, msg: "", err: false });

  const show = (msg, err = false) => {
    setToast({ show: true, msg, err });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  };

  return [toast, show];
}

// src/hooks/useNotifications.js  (exported from same file for simplicity)
export function useNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);

  const addNotif = (msg, type = "info") => {
    const n = {
      id: Date.now(),
      msg,
      type,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setNotifs(prev => [n, ...prev].slice(0, 20));
    setUnread(u => u + 1);
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const markRead = () => setUnread(0);
  const clearAll = () => { setNotifs([]); setUnread(0); };

  return { notifs, unread, addNotif, markRead, clearAll };
}
