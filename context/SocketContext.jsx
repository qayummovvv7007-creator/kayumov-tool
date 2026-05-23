"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      }
      return;
    }

    if (socketRef.current) return;

    // ✅ Dinamik import — faqat browser da, server da emas
    const initSocket = async () => {
      const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

      if (!SOCKET_URL) {
        console.warn("NEXT_PUBLIC_SOCKET_URL is not defined in .env.local");
        return;
      }

      // ✅ Dynamic import with { io } destructuring
      const { io } = await import("socket.io-client");

      const newSocket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setIsConnected(true);
        newSocket.emit("user:authenticate", {
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
        });
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      newSocket.on("users:online-list", (users) => {
        setOnlineUsers(users);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    };

    initSocket();

    return () => {
      // cleanup faqat component unmount bo'lganda
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};

export { SocketProvider, useSocket };
