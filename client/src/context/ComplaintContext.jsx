import { createContext, useState, useEffect } from "react";

export const ComplaintContext = createContext();

export function ComplaintProvider({ children }) {

  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("complaints");
    if (stored) {
      setComplaints(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("complaints", JSON.stringify(complaints));
  }, [complaints]);

  const addComplaint = (complaint) => {
    setComplaints([
      ...complaints,
      { ...complaint, id: Date.now(), status: "Pending" }
    ]);
  };

  const resolveComplaint = (id) => {
    setComplaints(
      complaints.map((c) =>
        c.id === id ? { ...c, status: "Resolved" } : c
      )
    );
  };

  return (
    <ComplaintContext.Provider
      value={{ complaints, addComplaint, resolveComplaint }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}