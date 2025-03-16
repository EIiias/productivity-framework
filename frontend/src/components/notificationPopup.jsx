import React, { useEffect, useState } from "react";
import "./notificationPopup.css"; // Import styles

export default function NotificationPopup({ notifications }) {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    if (notifications.length > 0) {
      setVisibleNotifications((prev) => [...prev, ...notifications]);

      // Remove notification after 5 seconds
      setTimeout(() => {
        setVisibleNotifications((prev) => prev.slice(1));
      }, 5000);
    }
  }, [notifications]);

  return (
    <div className="notification-container">
      {visibleNotifications.map((notif, index) => (
        <div key={index} className="notification">
          <strong>{notif.title}</strong>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  );
}