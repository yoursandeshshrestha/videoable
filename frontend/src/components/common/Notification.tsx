import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { removeNotification } from "../../store/slices/uiSlice";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const Notification = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);

  useEffect(() => {
    notifications.forEach((notification) => {
      const duration = notification.duration || 5000;
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, duration);

      return () => clearTimeout(timer);
    });
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    const iconClass = "text-[#37322f]";
    switch (type) {
      case "success":
        return <CheckCircle2 size={20} className={iconClass} />;
      case "error":
        return <AlertCircle size={20} className={iconClass} />;
      case "warning":
        return <AlertCircle size={20} className={iconClass} />;
      default:
        return <Info size={20} className={iconClass} />;
    }
  };

  const getStyles = (type: string) => {
    const baseStyles = "bg-white border-[#37322f]/10 text-[#37322f]";
    switch (type) {
      case "success":
        return `${baseStyles} shadow-sm`;
      case "error":
        return `${baseStyles} shadow-sm`;
      case "warning":
        return `${baseStyles} shadow-sm`;
      default:
        return `${baseStyles} shadow-sm`;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-md border ${getStyles(
            notification.type
          )} animate-slide-up`}
        >
          {getIcon(notification.type)}
          <p className="flex-1 text-sm">{notification.message}</p>
          <button
            onClick={() => dispatch(removeNotification(notification.id))}
            className="text-[#37322f]/60 hover:text-[#37322f] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notification;
