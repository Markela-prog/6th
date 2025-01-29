"use client";
import { useState, useEffect } from "react";

export default function PresentMode({ presentation, slides, onExit }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slideArea = { width: 800, height: 450 };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "Escape") {
        onExit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentSlideIndex]);

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="fixed inset-0 bg-black flex flex-col justify-center items-center text-white p-4">
      <h1 className="text-4xl font-bold mb-4">{presentation.title}</h1>

      {/* Slide Display Area */}
      <div
        className="relative bg-white text-black shadow-lg rounded-lg flex items-center justify-center"
        style={{ width: slideArea.width, height: slideArea.height }}
      >
        {slides.length > 0 ? (
          <>
            <p className="absolute top-2 left-2 text-sm text-gray-600">
              {`Slide ${currentSlideIndex + 1} / ${slides.length}`}
            </p>

            {/* Render Slide Elements */}
            {currentSlide.elements.map((el) => (
              <div
                key={el.id}
                className={`absolute ${
                  el.type === "shape"
                    ? el.shape === "circle"
                      ? "rounded-full"
                      : ""
                    : "bg-gray-100 p-2 rounded shadow-md text-black"
                }`}
                style={{
                  left: `${el.position.x}px`,
                  top: `${el.position.y}px`,
                  width: `${el.size.width}px`,
                  height: `${el.size.height}px`,
                  backgroundColor: el.color || "transparent",
                }}
              >
                {el.type === "text" && el.content}
              </div>
            ))}
          </>
        ) : (
          <p className="text-xl">No slides available</p>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={prevSlide}
          className="bg-gray-500 px-4 py-2 rounded-md disabled:opacity-50"
          disabled={currentSlideIndex === 0}
        >
          ← Previous
        </button>
        <button
          onClick={nextSlide}
          className="bg-blue-500 px-4 py-2 rounded-md disabled:opacity-50"
          disabled={currentSlideIndex >= slides.length - 1}
        >
          Next →
        </button>
        <button onClick={onExit} className="bg-red-500 px-4 py-2 rounded-md">
          Exit
        </button>
      </div>
    </div>
  );
}
