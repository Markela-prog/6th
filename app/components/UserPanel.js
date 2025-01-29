"use client";
import { updateUserRole } from "@/lib/presentation";
import { useState } from "react";
import { Users, ChevronDown } from "lucide-react";

export default function UserPanel({ users, userRole, presentationId }) {
  const [editingUser, setEditingUser] = useState(null);

  const handleRoleChange = async (userId, newRole) => {
    await updateUserRole(presentationId, userId, newRole);
    setEditingUser(null);
  };

  return (
    <div className="w-full md:w-1/1 min-w-[220px] bg-white shadow-lg p-4 border-r rounded-lg mt-3">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-gray-800">
        <Users className="w-5 h-5 text-blue-500" /> Participants
      </h2>

      <ul className="space-y-3">
        {users.map((user) => (
          <li
            key={user.userId}
            className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center shadow-sm"
          >
            <span className="font-medium text-gray-800">
              {user.userNickname || user.userId}
            </span>

            {userRole === "owner" && user.role !== "owner" ? (
              <div className="relative">
                <button
                  onClick={() =>
                    setEditingUser(
                      editingUser === user.userId ? null : user.userId
                    )
                  }
                  className="text-xs text-gray-600 flex items-center gap-1"
                >
                  {user.role} <ChevronDown className="w-3 h-3" />
                </button>

                {editingUser === user.userId && (
                  <div className="absolute right-0 bg-white shadow-md border rounded-lg mt-1">
                    <button
                      onClick={() => handleRoleChange(user.userId, "editor")}
                      className="block px-3 py-1 hover:bg-gray-200 text-sm w-full text-left"
                    >
                      Editor
                    </button>
                    <button
                      onClick={() => handleRoleChange(user.userId, "viewer")}
                      className="block px-3 py-1 hover:bg-gray-200 text-sm w-full text-left"
                    >
                      Viewer
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-500">{user.role}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
