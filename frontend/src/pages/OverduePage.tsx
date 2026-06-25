import React, { useEffect, useState } from "react";

import toast from "react-hot-toast";
import { showConfirmation } from "../components/ConfirmationToast";
import type { Doctor } from "../types/Doctor";
import type { Patient } from "../types/Patient";
import { getOverDues, notifyOverdue } from "../services/overdueService";
import { Clock } from "lucide-react";

interface OverdueEntry {
  reader: Patient;
  overdueBooks: {
    book: Doctor;
    lentDate: string;
    dueDate: string;
  }[];
}

const OverduePage: React.FC = () => {
  const [overdues, setOverdues] = useState<OverdueEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOverdues = async () => {
    try {
      setLoading(true);
      const res = await getOverDues();
      if (Array.isArray(res)) {
          setOverdues(res);
      } else {
          toast.error('Invalid response from server');
     }
    } catch (error) {
      toast.error("Failed to load overdue data");
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const sendNotifications = async () => {
    const confirm = await showConfirmation({
      message: "Send reminder emails to all overdue readers?",
      confirmText: "Send Emails",
    });

    if (!confirm) return;

    try {
      await notifyOverdue();
      toast.success("Notifications sent successfully");
    } catch (error) {
      toast.error("Failed to send notifications");
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOverdues();
  }, []);

  return (
    <div className="h-full overflow-y-auto px-4 py-6">

      <h1 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2 text-black">
        <Clock/>
        Overdue Readers
      </h1>

      <button
        onClick={sendNotifications}
        className="bg-red-600 text-white px-4 py-2 rounded mb-6"
        disabled={loading || overdues.length === 0}
      >
        Send Reminder Emails
      </button>

      {overdues.length === 0 ? (
        <p className="text-gray-600">No overdue records found.</p>
      ) : (
        overdues?.map((entry, idx) => (
          <div key={idx} className="mb-6 border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">
            </h2>
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Book Title</th>
                  <th className="p-2 border">Lent Date</th>
                  <th className="p-2 border">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {entry.overdueBooks.map((book, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{new Date(book.lentDate).toLocaleDateString()}</td>
                    <td className="p-2 border text-red-600 font-semibold">
                      {new Date(book.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default OverduePage;
