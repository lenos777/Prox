import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminNotification, NotificationEvent } from "@shared/api";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "hozirgina";
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return date.toLocaleDateString();
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AdminNotification | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/notifications");
    const data = await res.json();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
    // Connect to WebSocket for real-time updates
    const ws = new window.WebSocket(
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws/admin-notifications`
    );
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data: NotificationEvent = JSON.parse(event.data);
        if (data.type === "notification:new") {
          setNotifications((prev) => [data.notification, ...prev]);
          toast({ title: "Yangi xabarnoma", description: data.notification.title });
        } else if (data.type === "notification:read") {
          setNotifications((prev) => prev.map(n => n.id === data.id ? { ...n, read: true } : n));
        } else if (data.type === "notification:delete") {
          setNotifications((prev) => prev.filter(n => n.id !== data.id));
        }
      } catch {}
    };
    ws.onclose = () => {
      // Optionally: reconnect logic
    };
    return () => {
      ws.close();
    };
  }, []);

  const handleMarkRead = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}/read`, { method: "POST" });
    setNotifications((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    wsRef.current?.send(JSON.stringify({ type: "notification:read", id }));
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
    setNotifications((list) => list.filter((n) => n.id !== id));
    wsRef.current?.send(JSON.stringify({ type: "notification:delete", id }));
    toast({ title: "Xabarnoma o‘chirildi" });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <div>Yuklanmoqda...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Xabarnomalar</h2>
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount} yangi</Badge>
        )}
      </div>
      {notifications.length === 0 && <div>Xabarnoma yo‘q</div>}
      <div className="space-y-4">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`transition-all cursor-pointer ${n.read ? "opacity-60" : "border-primary border-2"}`}
            onClick={() => {
              setSelected(n);
              if (!n.read) handleMarkRead(n.id);
            }}
          >
            <CardHeader className="flex justify-between items-center">
              <span className="font-semibold">{n.title}</span>
              {!n.read && <Badge variant="destructive">Yangi</Badge>}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {formatTimeAgo(n.createdAt)}
                </span>
                <div className="flex gap-2">
                  {!n.read && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation();
                        handleMarkRead(n.id);
                      }}
                    >
                      O‘qildi
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(n.id);
                    }}
                  >
                    O‘chirish
                  </Button>
                </div>
              </div>
              <div className="truncate mt-2 text-base">{n.body}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-2">{selected?.body}</div>
          <div className="text-xs text-muted-foreground">
            {selected && formatTimeAgo(selected.createdAt)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 