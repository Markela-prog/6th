"use client";
import { useState } from "react";
import { Rnd } from "react-rnd"; // ✅ Draggable & Resizable
import { updateTextBlock, removeTextBlock } from "@/lib/slides";
import Markdown from "react-markdown"; // ✅ Markdown Support

export default function TextBlock({ presentationId, slideId, block, userRole }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);

  const handleDragStop = async (e, d) => {
    if (userRole !== "viewer") {
      await updateTextBlock(presentationId, slideId, { ...block, position: { x: d.x, y: d.y } });
    }
  };

  const handleResizeStop = async (e, direction, ref, delta, position) => {
    if (userRole !== "viewer") {
      await updateTextBlock(presentationId, slideId, { ...block, size: { width: ref.style.width, height: ref.style.height }, position });
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    await updateTextBlock(presentationId, slideId, { ...block, content });
  };

  return (
    <Rnd
      size={{ width: block.size.width, height: block.size.height }}
      position={{ x: block.position.x, y: block.position.y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      disableDragging={userRole === "viewer"}
      enableResizing={userRole !== "viewer"}
      className="absolute border p-2 bg-white shadow-md cursor-move"
    >
      {isEditing ? (
        <textarea
          value={content}
          onChange={handleContentChange}
          onBlur={handleBlur}
          className="w-full h-full p-2 border-none focus:outline-none"
          autoFocus
        />
      ) : (
        <div onClick={() => userRole !== "viewer" && setIsEditing(true)}>
          <Markdown>{content}</Markdown>
        </div>
      )}

      {userRole !== "viewer" && (
        <button className="absolute top-0 right-0 bg-red-500 text-white p-1 text-xs" onClick={() => removeTextBlock(presentationId, slideId, block.id)}>
          ✕
        </button>
      )}
    </Rnd>
  );
}
