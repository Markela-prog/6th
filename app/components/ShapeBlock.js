"use client";
import { useState } from "react";
import { Rnd } from "react-rnd";
import { updateTextBlock, removeTextBlock } from "@/lib/slides";

export default function ShapeBlock({
  presentationId,
  slideId,
  block,
  userRole,
  slideArea,
}) {
  const handleDragStop = async (e, d) => {
    if (userRole !== "viewer") {
      const newX = Math.max(
        0,
        Math.min(d.x, slideArea.width - block.size.width)
      );
      const newY = Math.max(
        0,
        Math.min(d.y, slideArea.height - block.size.height)
      );

      await updateTextBlock(presentationId, slideId, {
        ...block,
        position: { x: newX, y: newY },
      });
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
      enableResizing={userRole !== "viewer"}
      className="absolute cursor-move"
    >
      <div
        className={`w-full h-full ${
          block.shape === "circle" ? "rounded-full" : ""
        }`}
        style={{ backgroundColor: block.color }}
      ></div>

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
