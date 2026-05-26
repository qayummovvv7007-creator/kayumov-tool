"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // ✅ user.id ni useRef da saqlash — object reference muammosini hal qiladi
  const userIdRef = useRef(null);
  const usernameRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    const userId = user?.id || user?._id;

    // User chiqib ketsa — socketni uzish
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

    // ✅ Bir xil user — qayta ulanma
    if (socketRef.current && userIdRef.current === userId.toString()) return;

    userIdRef.current = userId.toString();
    usernameRef.current = user.username;
    avatarRef.current = user.avatar;

    const initSocket = async () => {
      const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
      if (!SOCKET_URL) {
        console.warn("NEXT_PUBLIC_SOCKET_URL is not defined");
        return;
      }

      // Eski socketni tozalash
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
        console.log("Socket connected:", newSocket.id);
        setIsConnected(true);
        // ✅ Ref dan o'qish — closure muammosi yo'q
        newSocket.emit("user:authenticate", {
          userId: userIdRef.current,
          username: usernameRef.current,
          avatar: avatarRef.current,
        });
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
      });

      newSocket.on("reconnect", () => {
        console.log("Socket reconnected");
        setIsConnected(true);
        newSocket.emit("user:authenticate", {
          userId: userIdRef.current,
          username: usernameRef.current,
          avatar: avatarRef.current,
        });
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

    // ✅ Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [user?.id || user?._id]); // ✅ faqat ID o'zgarganda qayta ishlaydi

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
