import React from "react";
import "./UsersPanel.css";
import { Wifi, WifiOff } from "lucide-react";

const UsersPanel = ({ users, myInfo, connected }) => {
  return (
    <div className="users-panel">
      <div className="connection-badge" data-connected={connected}>
        {connected ? (
          <Wifi size={12} strokeWidth={2} />
        ) : (
          <WifiOff size={12} strokeWidth={2} />
        )}
        <span>{connected ? "live" : "offline"}</span>
      </div>

      <div className="users-list">
        {users.map((user) => (
          <div className="user-chip" key={user.id}>
            <span className="user-avatar" style={{ background: user.color }}>
              {user.name?.charAt(5) || "?"}
            </span>
            <span className="user-name">
              {user.id === myInfo?.id ? "you" : user.name}
            </span>
          </div>
        ))}
      </div>

      <div className="users-count">
        {users.length} {users.length === 1 ? "person" : "people"} online
      </div>
    </div>
  );
};

export default UsersPanel;
