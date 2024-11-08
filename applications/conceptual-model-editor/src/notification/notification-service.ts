
export enum NotificationType {
  Success,
  Error,
}

export interface Notification {
  /**
   * Notification type.
   */
  type: NotificationType;
  /**
   * Human readable label.
   */
  label: string;
  /**
   * How long should the notification remain active.
   */
  timeToLive: number;
}

export type EventChangeListener = (service: NotificationService) => void;

export interface NotificationService {
  /**
   * Add a new success level notification.
   */
  addSuccess: (label: string) => void;
  /**
   * Add a new error level notification.
   */
  addError: (label: string) => void;
  /**
   * Register listener for changed in the service.
   */
  addListener: (listener: EventChangeListener) => void;
  /**
   * Remove listener.
   */
  removeListener: (listener: EventChangeListener) => void;
  /**
   * Return list of all visible notifications.
   */
  activeNotifications: () => Notification[];
}

const SUCCESS_MESSAGE_TTL_MS = 3000;

const ERROR_MESSAGE_TTL_MS = 5000;

const MESSAGE_UPDATE_INTERVAL_MS = 1000;

/**
 * The service register an interval to remove older notifications.
 * Every write operation creates new array in order to be easily used with React.
 */
class DefaultNotificationService implements NotificationService {

  private notifications: Notification[] = [];

  private listeners: EventChangeListener[] = [];

  constructor() {
    setInterval(() => this.pruneEvents(), MESSAGE_UPDATE_INTERVAL_MS);
  }

  private pruneEvents() {
    const now = Date.now();
    const nextNotifications = this.notifications.filter(notification => notification.timeToLive > now);
    if (nextNotifications.length === this.notifications.length) {
      return;
    }
    this.notifications = nextNotifications;
    this.notifyListeners();
  }

  addSuccess(label: string) {
    this.notifications = [...this.notifications, {
      label,
      type: NotificationType.Success,
      timeToLive: Date.now() + SUCCESS_MESSAGE_TTL_MS,
    }];
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this));
  }

  addError(label: string) {
    this.notifications = [...this.notifications, {
      label,
      type: NotificationType.Error,
      timeToLive: Date.now() + ERROR_MESSAGE_TTL_MS,
    }];
    this.notifyListeners();
  }

  addListener(listener: EventChangeListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: EventChangeListener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  activeNotifications() {
    return this.notifications;
  }

}

export const notificationService = new DefaultNotificationService();
