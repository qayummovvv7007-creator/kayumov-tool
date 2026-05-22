// context/SocketContext.jsx
// Global Socket.io ulanish — komponentlar o'rtasida bitta ulanish

"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Foydalanuvchi login qilgandan keyin socket ga ulanish
    if (user && !socketRef.current) {
      const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

      const newSocket = io(SOCKET_URL, {
        transports: ["websocket", "polling"], // Polling fallback
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Ulanish hodisalari
      newSocket.on("connect", () => {
        console.log("🔌 Socket connected:", newSocket.id);
        setIsConnected(true);

        // Server ga foydalanuvchi ma'lumotlarini yuborish
        newSocket.emit("user:authenticate", {
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
        });
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        setIsConnected(false);
      });

      // Online foydalanuvchilar ro'yxati yangilanganda
      newSocket.on("users:online-list", (users) => {
        setOnlineUsers(users);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    }

    // Foydalanuvchi logout qilganda socket ni uzish
    if (!user && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
    }

    return () => {
      // Komponent o'chirilganda socketni tozalash (lekin ulanishni uzma)
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};
