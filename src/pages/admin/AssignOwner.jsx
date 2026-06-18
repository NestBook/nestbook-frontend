import { useState } from "react";
import { useParams } from "react-router-dom";
import { assignHotelOwnerApi } from "../../services/adminService";

const AssignOwner = () => {
  const { hotelId } = useParams();

  const [ownerId, setOwnerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAssign = async () => {
    if (!ownerId.trim()) {
      return alert("Nhập Owner ID");
    }

    try {
      setLoading(true);

      await assignHotelOwnerApi(hotelId, ownerId);

      setMessage("Gán owner thành công");
    } catch (err) {
      console.error(err);

      setMessage("Gán owner thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Assign Hotel Owner</h1>

      <div className="border rounded-lg p-4">
        <label className="block text-sm mb-2">Owner ID</label>

        <input
          type="text"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Nhập owner id"
        />

        <button
          onClick={handleAssign}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Đang gán..." : "Assign Owner"}
        </button>

        {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default AssignOwner;
