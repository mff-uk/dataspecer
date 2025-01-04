import { useEffect, useState } from "react";
import { type EventChangeListener, type Notification, notificationService } from "./notification-service";

export interface UseNotificationServiceType {
  /**
   * All visible notification.
   */
  notifications: Notification[];
}

/**
 * We separate writing to another hook as it should not change,
 * when a message is added to not trigger a re-render.
 */
export interface UseNotificationServiceWriterType {
  /**
   * Add success notification.
   */
  success: (label: string) => void;
  /**
   * Add error notification.
   */
  error: (label: string) => void;
}

/**
 * Provide a read-only access to notifications.
 */
export const useNotificationService = (): UseNotificationServiceType => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const listener: EventChangeListener = () => setNotifications(notificationService.activeNotifications());
    notificationService.addListener(listener);
    return () => notificationService.removeListener(listener);
  }, [setNotifications]);

  return {
    notifications,
  };
};

const writer: UseNotificationServiceWriterType = {
  success: (label: string) => notificationService.addSuccess(label),
  error: (label: string) => notificationService.addError(label),
};

/**
 * Return stable functions for creating notifications.
 */
export const useNotificationServiceWriter = (): UseNotificationServiceWriterType => {
  return writer;
};
