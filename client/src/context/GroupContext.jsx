import { createContext, useState, useEffect } from "react";

export const GroupContext = createContext();

export function GroupProvider({ children }) {

  const [group, setGroup] = useState(null);

  useEffect(() => {
    const storedGroup = localStorage.getItem("group");
    if (storedGroup) {
      setGroup(JSON.parse(storedGroup));
    }
  }, []);

  const createGroup = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const newGroup = {
      code,
      members: [],
      items: [],
    };

    setGroup(newGroup);
    localStorage.setItem("group", JSON.stringify(newGroup));
  };

  const joinGroup = (code) => {
    const storedGroup = JSON.parse(localStorage.getItem("group"));

    if (storedGroup && storedGroup.code === code) {
      setGroup(storedGroup);
      return true;
    }

    return false;
  };

  const clearGroup = () => {
    setGroup(null);
    localStorage.removeItem("group");
  };

  return (
    <GroupContext.Provider
      value={{ group, createGroup, joinGroup, clearGroup }}
    >
      {children}
    </GroupContext.Provider>
  );
}