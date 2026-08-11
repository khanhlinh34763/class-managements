import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message, confirmText = 'Xác nhận', danger = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center gap-3">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <AlertTriangle size={28} className={danger ? 'text-red-500' : 'text-yellow-500'} />
        </div>
        <p className="text-gray-600">{message}</p>
        <div className="flex gap-3 w-full mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-white transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-happy-blue hover:bg-blue-600'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}