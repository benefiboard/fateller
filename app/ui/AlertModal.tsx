// app/ui/AlertModal.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, title, message, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 mr-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <div className="text-sm text-gray-600">
              {typeof message === 'string' ? <p>{message}</p> : message}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
