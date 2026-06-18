import type { Doctor } from "../../types/Doctor.ts";
import type { Lending } from "../../types/Lending";
import type { Reader } from "../../types/Reader";

interface LendingTableProps {
    activeLendings: Lending[];
    search: string;
    onReturn: (lendingId: string) => void;
}

const LendingTable:React.FC<LendingTableProps> = ({
    activeLendings,
    search,
    onReturn
}) => {
    return(
        <>
            <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Reader</th>
              <th className="p-2 border">Book</th>
              <th className="p-2 border">Lent Date</th>
              <th className="p-2 border">Due Date</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {activeLendings.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No active lendings
                </td>
              </tr>
            )}
            {activeLendings.filter((lending: Lending)=> {
              const term = search.toLowerCase();
              return(
                term === " " ||
                (lending.reader as Reader).name.toLowerCase().includes(term) ||
                (lending.book as Doctor).title.toLowerCase().includes(term)
              )
              
            }
            
            ).map((lending: Lending) => (
              <tr key={lending._id}>
                <td className="p-2 border">
                  {(lending.reader as Reader).name}
                </td>
                <td className="p-2 border">{(lending.book as Doctor).title}</td>
                <td className="p-2 border">
                  {new Date(lending.lentDate).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  {new Date(lending.dueDate).toLocaleDateString()}
                </td>
                <td className="p-2 border flex justify-center">
                  <button
                    onClick={() => onReturn(lending._id!)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </>
    )
}

export default LendingTable;