import { useEffect, useState } from 'react';

export default function useWebSocket(url) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => console.log('✅ WebSocket Connected');
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'TASK_OVERDUE') {
        console.log(`🔔 Task Overdue: ${message.title} (Due: ${message.deadline})`);
        setNotifications((prev) => [...prev, message]);
      }
    };

    ws.onclose = () => console.log('❌ WebSocket Disconnected');

    return () => ws.close(); // Cleanup WebSocket on unmount
  }, [url]);

  return notifications;
}
