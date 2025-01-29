"use client";
import { useEffect, useState } from "react";
import { listenToSlides, addTextBlock } from "@/lib/slides";
import { v4 as uuidv4 } from "uuid"; 
import TextBlock from "@/app/components/TextBlock";

export default function TextBlocksManager({ presentationId, slideId, userRole }) {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const unsubscribe = listenToSlides(presentationId, (slides) => {
      const currentSlide = slides.find(slide => slide.id === slideId);
      if (currentSlide) {
        setElements(currentSlide.elements || []);
      }
    });

    return () => unsubscribe();
  }, [presentationId, slideId]);

  const handleAddTextBlock = async () => {
    if (userRole !== "viewer") {
      const newBlock = {
        id: uuidv4(),
        type: "text",
        content: "New Text",
        position: { x: 100, y: elements.length * 60 },
        size: { width: 200, height: 50 },
      };
      await addTextBlock(presentationId, slideId, newBlock);
    }
  };

  return (
    <div className="relative w-full h-full">
      {userRole !== "viewer" && (
        <button onClick={handleAddTextBlock} className="absolute top-2 left-2 bg-blue-500 text-white p-2 rounded">
          + Add Text
        </button>
      )}

      {elements.map((block) => (
        <TextBlock key={block.id} presentationId={presentationId} slideId={slideId} block={block} userRole={userRole} />
      ))}
    </div>
  );
}
