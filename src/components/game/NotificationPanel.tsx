'use client';

import { useGameStore } from '@/store/game-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, X, Trophy, TrendingUp, Info, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NotificationPanel() {
  const { notifications, markNotificationRead, unreadNotificationCount } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [latestNotification, setLatestNotification] = useState<typeof notifications[0] | null>(null);
  const unread = unreadNotificationCount();

  // Show toast for new notifications
  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].read) {
      const notif = notifications[0];
      const timer = setTimeout(() => {
        setLatestNotification(notif);
        setTimeout(() => setLatestNotification(null), 4000);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const getIcon = (type: string, icon: string) => {
    if (icon) return <span className="text-lg">{icon}</span>;
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-amber-500" />;
      case 'tier_up': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'reputation_change': return <Star className="h-4 w-4 text-violet-500" />;
      default: return <Info className="h-4 w-4 text-cyan-500" />;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'achievement': return 'border-amber-500/30 bg-amber-500/5';
      case 'tier_up': return 'border-emerald-500/30 bg-emerald-500/5';
      case 'reputation_change': return 'border-violet-500/30 bg-violet-500/5';
      default: return 'border-border/50 bg-card/50';
    }
  };

  return (
    <>
      {/* Floating Toast for Latest Notification */}
      <AnimatePresence>
        {latestNotification && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-14 right-4 z-50 max-w-xs"
          >
            <div className={`rounded-xl border p-3 shadow-xl backdrop-blur-md ${getTypeBg(latestNotification.type)}`}>
              <div className="flex items-start gap-2">
                <div className="shrink-0 mt-0.5">{getIcon(latestNotification.type, latestNotification.icon)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold">{latestNotification.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{latestNotification.message}</p>
                </div>
                <button
                  onClick={() => setLatestNotification(null)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Bell Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-500 text-[9px] font-bold text-black flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>

        {/* Notification Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-border/50 bg-card shadow-xl"
              >
                <div className="p-3 border-b border-border/30 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {unread > 0 && (
                    <button
                      onClick={() => notifications.forEach(n => markNotificationRead(n.id))}
                      className="text-[10px] text-amber-500 hover:text-amber-400"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <ScrollArea className="max-h-80">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {notifications.slice(0, 20).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                            notif.read
                              ? 'opacity-50 hover:opacity-70'
                              : `hover:bg-muted/50 ${getTypeBg(notif.type)}`
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="shrink-0 mt-0.5">{getIcon(notif.type, notif.icon)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold">{notif.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{notif.message}</p>
                              <p className="text-[9px] text-muted-foreground/50 mt-1">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
