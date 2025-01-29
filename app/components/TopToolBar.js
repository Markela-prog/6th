"use client";
import { Plus, Square, Circle, Play } from "lucide-react";

export default function TopToolbar({
  onAddText,
  onAddShape,
  onPresent,
  userRole,
}) {
  return (
    <div className="bg-white shadow-md p-3 flex justify-between items-center border-b w-full space-x-2">
      {userRole !== "viewer" && (
        <>
          <div className="flex space-x-2">
            <button
              onClick={() => onAddText()}
              className="bg-blue-500 text-white p-2 rounded flex items-center gap-2 hover:bg-blue-600 transition"
            >
              <Plus className="w-5 h-5" /> Add Text
            </button>

            <button
              onClick={() => onAddShape("rectangle")}
              className="bg-green-500 text-white p-2 rounded flex items-center gap-2 ml-2 hover:bg-green-600 transition"
            >
              <Square className="w-5 h-5" /> Rectangle
            </button>

            <button
              onClick={() => onAddShape("circle")}
              className="bg-yellow-500 text-white p-2 rounded flex items-center gap-2 ml-2 hover:bg-yellow-600 transition"
            >
              <Circle className="w-5 h-5" /> Circle
            </button>
          </div>
        </>
      )}

      {/* Viewers can now see this button */}
      <button
        onClick={onPresent}
        className="bg-purple-500 text-white p-2 gap-2 ml-2 rounded flex items-center hover:bg-purple-600 transition"
      >
        <Play size={20} className="mr-1" /> Start Presentation
      </button>
    </div>
  );
}
