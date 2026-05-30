"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const socketRef = useRef(null);
  const userIdRef = useRef(null);
  const usernameRef = useRef(null);
  const avatarRef = useRef(null);

  // ✅ Stable qiymat
  const userId = user?.id?.toString() || user?._id?.toString() || null;

  useEffect(() => {
    if (!userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      }
      userIdRef.current = null;
      return;
    }

    if (socketRef.current && userIdRef.current === userId) return;

    userIdRef.current = userId;
    usernameRef.current = user.username;
    avatarRef.current = user.avatar;

    const initSocket = async () => {
      const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
      if (!SOCKET_URL) return;

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      const { io } = await import("socket.io-client");

      const newSocket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 20000,
      });

      newSocket.on("connect", () => {
        setIsConnected(true);
        newSocket.emit("user:authenticate", {
          userId: userIdRef.current,
          username: usernameRef.current,
          avatar: avatarRef.current,
        });
      });

      newSocket.on("disconnect", () => setIsConnected(false));

      newSocket.on("reconnect", () => {
        setIsConnected(true);
        newSocket.emit("user:authenticate", {
          userId: userIdRef.current,
          username: usernameRef.current,
          avatar: avatarRef.current,
        });
      });

      newSocket.on("users:online-list", (users) => setOnlineUsers(users));

      newSocket.on("dm:received", (msg) => {
        const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
        if (senderId !== userIdRef.current) {
          setTotalUnread((n) => n + 1);
        }
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket error:", err.message);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [userId]); // ✅ stable string

  return (
    <SocketContext.Provider
      value={{ socket, onlineUsers, isConnected, totalUnread, setTotalUnread }}
    >
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
