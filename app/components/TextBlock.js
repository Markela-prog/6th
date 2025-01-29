"use client";
import { useState } from "react";
import { Rnd } from "react-rnd";
import { updateTextBlock, removeTextBlock } from "@/lib/slides";
import Markdown from "react-markdown";

export default function TextBlock({ presentationId, slideId, block, userRole, slideArea }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);

  const handleDragStop = async (e, d) => {
    if (userRole !== "viewer") {
      const newX = Math.max(0, Math.min(d.x, slideArea.width - block.size.width));
      const newY = Math.max(0, Math.min(d.y, slideArea.height - block.size.height));

      await updateTextBlock(presentationId, slideId, { ...block, position: { x: newX, y: newY } });
    }
  };

  const handleResizeStop = async (e, direction, ref, delta, position) => {
    if (userRole !== "viewer") {
      const newWidth = parseInt(ref.style.width);
      const newHeight = parseInt(ref.style.height);

      await updateTextBlock(presentationId, slideId, {
        ...block,
        size: { width: newWidth, height: newHeight },
        position,
      });
    }
  };

  return (
    <Rnd
      size={{ width: block.size.width, height: block.size.height }}
      position={{ x: block.position.x, y: block.position.y }}
      bounds="parent"
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      disableDragging={userRole === "viewer"}
      enableResizing={userRole !== "viewer"}
      className="absolute border border-gray-300 p-2 bg-white text-black shadow-md rounded-lg cursor-move"
    >
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={async () => {
            setIsEditing(false);
            await updateTextBlock(presentationId, slideId, { ...block, content });
          }}
          className="w-full h-full p-2 border border-gray-300 rounded bg-white text-black focus:ring focus:ring-blue-300 focus:outline-none shadow-md"
          autoFocus
        />
      ) : (
        <div onClick={() => userRole !== "viewer" && setIsEditing(true)}>
          <Markdown>{content}</Markdown>
        </div>
      )}

      {userRole !== "viewer" && (
        <button
          className="absolute top-0 right-0 bg-red-500 text-white p-1 text-xs"
          onClick={() => removeTextBlock(presentationId, slideId, block.id)}
        >
          ✕
        </button>
      )}
    </Rnd>
  );
}
