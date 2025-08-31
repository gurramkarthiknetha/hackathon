import { Bell } from 'lucide-react';
import useNotificationStore from '../../store/notificationStore';

const ModalTestButton = () => {
  const { showModalNotification } = useNotificationStore();

  const handleTest = () => {
    console.log('Direct store test button clicked');
    showModalNotification({
      type: 'emergency',
      severity: 'critical',
      title: '🚨 Direct Store Test',
      message: 'This is a direct test of the modal notification system using the store function. Audio should play if not blocked by browser.',
      timestamp: new Date()
    });
  };

  return (
    <button
      onClick={handleTest}
      className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg z-50 flex items-center space-x-2"
      title="Test Modal Notification"
    >
      <Bell className="h-5 w-5" />
      <span className="hidden sm:inline">Test Modal</span>
    </button>
  );
};

export default ModalTestButton;
