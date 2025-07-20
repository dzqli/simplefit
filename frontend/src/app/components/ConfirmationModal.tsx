import React from 'react';

type ConfirmationModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="m-6 bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          {onCancel && (
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-blue-700"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
