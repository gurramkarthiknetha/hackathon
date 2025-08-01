import { useEffect } from 'react';
import NotificationModal from './NotificationModal';
import useNotificationStore from '../../store/notificationStore';

/**
 * Provider component that manages the global notification modal
 * This should be placed at the root level of the app to ensure
 * the modal can appear over any content
 */
const NotificationModalProvider = () => {
  const {
    modalNotification,
    isModalOpen,
    closeModalNotification
  } = useNotificationStore();

  // Debug logging
  console.log('NotificationModalProvider render - isModalOpen:', isModalOpen, 'modalNotification:', modalNotification);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Close modal on Escape key
      if (event.key === 'Escape' && isModalOpen) {
        closeModalNotification();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, closeModalNotification]);

  return (
    <NotificationModal
      isOpen={isModalOpen}
      onClose={closeModalNotification}
      notification={modalNotification}
      autoPlayAudio={true}
    />
  );
};

export default NotificationModalProvider;
