import React from "react";
import { MousePointer2 } from "lucide-react";
import "./Cursors.css";

const Cursors = ({ users, myInfo }) => {
  return (
    <div className="cursors-overlay">
      {users
        .filter((user) => user.id !== myInfo?.id && user.cursor)
        .map((user) => (
          <div
            key={user.id}
            className="remote-cursor"
            style={{
              left: user.cursor.x,
              top: user.cursor.y,
              "--user-color": user.color,
            }}
          >
            <MousePointer2
              size={18}
              fill={user.color}
              color={user.color}
              strokeWidth={1}
            />
            <span className="cursor-label">{user.name}</span>
          </div>
        ))}
    </div>
  );
};

export default Cursors;
