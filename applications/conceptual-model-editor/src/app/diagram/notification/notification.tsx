import { type Notification, NotificationType } from "./notification-service";
import { useNotificationService } from "./notification-service-context";
import { t } from "../application";

/**
 * There is a know issue where when there is a change in the notification service files,
 * the notifications do stop working. This is probably due to direct import of the notification service,
 * which is not correctly propagated on update.
 */
export const NotificationList = () => {
  const { notifications } = useNotificationService();
  return (
    <div className="fixed bottom-5 w-full flex flex-col items-center gap-y-2">
      {notifications.map(notification => renderNotification(notification))}
    </div>
  );
};

/**
 * https://flowbite.com/docs/components/toast/
 */
const renderNotification = (notification: Notification) => {
  const key = String(notification.timeToLive) + notification.label;
  const Icon = iconForNotification(notification);
  // flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800
  return (
    <div key={key} className="flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-white divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg shadow dark:text-gray-400 dark:divide-gray-700 dark:bg-gray-800" role="alert">
      <Icon />
      <div className="text-sm font-normal">
        {notification.label}
      </div>
    </div>
  );
};

const iconForNotification = (notification: Notification) => {
  switch (notification.type) {
    case NotificationType.Success:
      return IconSuccess;
    case NotificationType.Error:
      return IconError;
  }
};

/**
 * https://flowbite.com/docs/components/toast/
 */
const IconSuccess = () => (
  <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
    </svg>
    <span className="sr-only">{t("notification.icon-sucess")}</span>
  </div>
);

/**
 * https://flowbite.com/docs/components/toast/
 */
const IconError = () => (
  <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
    </svg>
    <span className="sr-only">{t("notification.icon-error")}</span>
  </div>
);
