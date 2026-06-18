import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

// interface ConfirmationToastProps {
//   message: string;
//   confirmText?: string;
//   cancelText?: string;
//   onConfirm: () => Promise<void> | void;
//   onCancel?: () => void;
// }

// The actual confirmation function you'll use in components
// eslint-disable-next-line react-refresh/only-export-components
export const showConfirmation = async (options: {
  message: string;
  confirmText?: string;
  cancelText?: string;
}): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    toast.custom(
      (t) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border dark:border-gray-700 max-w-md">
          <p className="font-semibold text-lg mb-3 dark:text-white">{options.message}</p>
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition text-gray-800 dark:text-white"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
            >
              {options.cancelText || 'Cancel'}
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
            >
              {options.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  });
};

// Component just for the Toaster provider
export const ConfirmationToast = () => {
  return <Toaster position="top-center" />;
};