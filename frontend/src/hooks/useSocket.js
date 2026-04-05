import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export function useSocket(serverUrl) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [myInfo, setMyInfo] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socketRef.current = io(serverUrl, {
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("init", ({ users: initialUsers, myId, myColor, myName }) => {
      setMyInfo({ id: myId, color: myColor, name: myName });
      setUsers(initialUsers);
    });

    socket.on("user-joined", (user) => {
      setUsers((prev) => [...prev.filter((u) => u.id !== user.id), user]);
    });

    socket.on("user-left", (id) => {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    });

    socket.on("cursor-update", (data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.id ? { ...u, cursor: { x: data.x, y: data.y } } : u,
        ),
      );
    });

    return () => socket.disconnect();
  }, [serverUrl]);

  const emit = (event, data) => {
    if (socketRef.current) socketRef.current.emit(event, data);
  };

  const on = (event, handler) => {
    if (socketRef.current) socketRef.current.on(event, handler);
  };

  const off = (event, handler) => {
    if (socketRef.current) socketRef.current.off(event, handler);
  };

  return { socket: socketRef, connected, myInfo, users, emit, on, off };
}
