import React, { useState, useEffect } from 'react';
import '../assets/Notification.css'; // We'll create this CSS file next

const Notification = ({ message, type, onDone }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDone) onDone(); // Callback to clear the message
      }, 3000); // Notification disappears after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [message, onDone]);

  if (!visible) return null;

  return (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );
};

export default Notification;