import { useState, useEffect } from 'react';
import { NotificationType } from '../utils/types';

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationType | null>(null);

  // 알림 표시
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  // 알림 숨기기
  const hideNotification = () => {
    setNotification(null);
  };

  // 알림 타이머 설정
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return {
    notification,
    showNotification,
    hideNotification,
  };
};

export default useNotification;
