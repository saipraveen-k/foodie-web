import { useContext, useState } from "react";
import { GroupContext } from "../context/GroupContext";

function GroupOrder() {

  const { group, createGroup, joinGroup, clearGroup } =
    useContext(GroupContext);

  const [codeInput, setCodeInput] = useState("");
  const [message, setMessage] = useState("");

  const handleJoin = () => {
    const success = joinGroup(codeInput);

    if (success) {
      setMessage("Joined group successfully!");
    } else {
      setMessage("Invalid group code");
    }
  };

  return (
    <div className="min-h-screen bg-cream p-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">

        <h2 className="text-3xl font-heading text-midnight mb-6">
          Group Order
        </h2>

        {!group ? (
          <div className="space-y-4">

            <button
              onClick={createGroup}
              className="w-full bg-gold text-midnight py-2 rounded-lg font-semibold"
            >
              Create Group
            </button>

            <div className="text-center">OR</div>

            <input
              type="text"
              placeholder="Enter Group Code"
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setCodeInput(e.target.value)}
            />

            <button
              onClick={handleJoin}
              className="w-full bg-midnight text-cream py-2 rounded-lg"
            >
              Join Group
            </button>

            {message && (
              <p className="text-sm mt-2">{message}</p>
            )}

          </div>
        ) : (
          <div className="space-y-4">

            <p>
              Group Code:{" "}
              <span className="font-bold text-gold">
                {group.code}
              </span>
            </p>

            <button
              onClick={clearGroup}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              End Group
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default GroupOrder;