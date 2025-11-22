
import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { amunetApi } from '../services/AmunetAPI';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Expose global notification function and listen for events
  useEffect(() => {
    // Attach to window for easy access from anywhere
    (window as any).showNotification = (type: Notification['type'], title: string, message: string) => {
      const notification: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        title,
        message,
        timestamp: Date.now()
      };

      setNotifications(prev => [notification, ...prev].slice(0, 5)); // Keep max 5

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    // Also listen to internal Sentinel API events for notifications
    const unsubscribe = amunetApi.subscribeToRealTimeEvents((event) => {
        if (event.type === 'rotation_complete') {
            (window as any).showNotification('success', 'IP Rotation Complete', `Agent ${event.data.agentId} migrated to ${event.data.newIp}`);
        } else if (event.type === 'intrusion_detected') {
            (window as any).showNotification('error', 'Intrusion Detected', `Blocked threat from ${event.data.sourceIp}`);
        } else if (event.type === 'config_update') {
            (window as any).showNotification('info', 'Config Updated', 'Agent configuration propagated.');
        }
    });

    return () => unsubscribe();
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertTriangle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-sentinel-success/10 border-sentinel-success/50 text-sentinel-success';
      case 'error': return 'bg-sentinel-danger/10 border-sentinel-danger/50 text-sentinel-danger';
      case 'warning': return 'bg-sentinel-warning/10 border-sentinel-warning/50 text-sentinel-warning';
      case 'info': return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-md w-full pointer-events-none">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border backdrop-blur-lg shadow-xl pointer-events-auto transition-all duration-300 animate-in slide-in-from-right ${getColor(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 text-sm">{notification.title}</h4>
              <p className="text-xs opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
