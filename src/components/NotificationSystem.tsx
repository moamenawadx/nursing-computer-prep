import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

let notificationId = 0;
const listeners: ((notification: NotificationContextType) => void)[] = [];
let state: NotificationContextType = {
  notifications: [],
  addNotification: (notification) => {
    const id = `notification-${notificationId++}`;
    const newNotification = { ...notification, id };
    state.notifications = [...state.notifications, newNotification];
    listeners.forEach((listener) => listener(state));

    if (notification.duration !== 0) {
      setTimeout(() => {
        state.removeNotification(id);
      }, notification.duration || 5000);
    }
  },
  removeNotification: (id) => {
    state.notifications = state.notifications.filter((n) => n.id !== id);
    listeners.forEach((listener) => listener(state));
  },
};

export const useNotification = () => {
  const [, setNotifications] = useState<NotificationContextType>(state);

  useEffect(() => {
    const listener = (newState: NotificationContextType) => {
      setNotifications(newState);
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return state.addNotification;
};

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const listener = (newState: NotificationContextType) => {
      setNotifications(newState.notifications);
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 space-y-3">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            transition={{ duration: 0.3 }}
            className={`border rounded-lg p-4 shadow-lg flex items-start gap-3 ${getBgColor(
              notification.type
            )}`}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                {notification.title}
              </h3>
              <p className="text-gray-700 text-xs md:text-sm mt-1">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => state.removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
