import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/axiosSetup";
import { AuthContext } from "./AuthContext";

export const ComplaintContext = createContext();

export function ComplaintProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchComplaints();
    } else {
      setComplaints([]);
    }
  }, [isAuthenticated]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get("/complaints/my-complaints");
      if (res.data.complaints) {
        setComplaints(res.data.complaints);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const addComplaint = async (orderId, message) => {
    try {
      const res = await api.post("/complaints/submit", { orderId, message });
      if (res.data.complaint) {
        setComplaints([res.data.complaint, ...complaints]);
      }
      return res.data;
    } catch (error) {
      console.error("Error adding complaint:", error);
      throw error;
    }
  };

  const resolveComplaint = async (id, status = "Resolved", adminResponse = "") => {
    try {
      const res = await api.put(`/complaints/${id}/status`, { status, adminResponse });
      if (res.data.complaint) {
        setComplaints(complaints.map(c => c._id === id ? res.data.complaint : c));
      }
      return res.data;
    } catch (error) {
      console.error("Error resolving complaint:", error);
      throw error;
    }
  };

  return (
    <ComplaintContext.Provider
      value={{ complaints, loading, addComplaint, resolveComplaint, fetchComplaints }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}