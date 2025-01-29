"use client";
import { useEffect, useState } from "react";
import { listenToSlides } from "@/lib/slides";
import TextBlock from "@/app/components/TextBlock";
import ShapeBlock from "@/app/components/ShapeBlock";

export default function SlideCanvas({ presentationId, slideId, userRole }) {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const slideArea = {
    width: 800,
    height: 450,
  };

  useEffect(() => {
    const unsubscribe = listenToSlides(presentationId, (slides) => {
      const currentSlide = slides.find((slide) => slide.id === slideId);
      if (currentSlide) {
        setElements(currentSlide.elements || []);
      }
    });

    return () => unsubscribe();
  }, [presentationId, slideId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".interactive-element")) {
        setSelectedId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-center items-center w-full h-full bg-gray-100">
      <div
        className="relative bg-white border shadow-lg rounded-lg"
        style={{ width: slideArea.width, height: slideArea.height }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Render Elements */}
        {elements.map((block) =>
          block.type === "text" ? (
            <TextBlock
              key={block.id}
              presentationId={presentationId}
              slideId={slideId}
              block={block}
              userRole={userRole}
              slideArea={slideArea}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
            />
          ) : (
            <ShapeBlock
              key={block.id}
              presentationId={presentationId}
              slideId={slideId}
              block={block}
              userRole={userRole}
              slideArea={slideArea}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
            />
          )
        )}
      </div>
    </div>
  );
}
