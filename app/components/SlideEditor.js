"use client";
import { useEffect, useState } from "react";
import {
  getSlides,
  listenToSlides,
  createSlide,
  deleteSlide,
} from "@/lib/slides";
import TextBlocksManager from "@/app/components/TextBlocksManager";

export default function SlideEditor({ presentationId, userRole }) {
  console.log("SlideEditor received userRole:", userRole);

  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(null);

  useEffect(() => {
    const fetchSlides = async () => {
      const slidesData = await getSlides(presentationId);
      setSlides(slidesData);

      // ✅ Preserve active slide if it's already selected
      if (slidesData.length > 0 && !activeSlide) {
        setActiveSlide(slidesData[0].id);
      }
    };

    fetchSlides();

    const unsubscribe = listenToSlides(presentationId, (updatedSlides) => {
      setSlides(updatedSlides);

      // ✅ Preserve active slide if it still exists
      const slideExists = updatedSlides.some(slide => slide.id === activeSlide);
      if (!slideExists && updatedSlides.length > 0) {
        setActiveSlide(updatedSlides[0].id); // Set first slide only if the current one is deleted
      }
    });

    return () => unsubscribe();
  }, [presentationId, activeSlide]); // ✅ Depend on activeSlide

  const handleAddSlide = async () => {
    if (userRole === "owner" || userRole === "editor") {
      const newSlideId = await createSlide(presentationId);
      if (newSlideId) {
        setSlides([...slides, { id: newSlideId, elements: [] }]); 
        setActiveSlide(newSlideId); // ✅ Stay on the newly created slide
      }
    }
  };

  const handleDeleteSlide = async () => {
    if ((userRole === "owner" || userRole === "editor") && activeSlide) {
      await deleteSlide(presentationId, activeSlide);
      const remainingSlides = slides.filter((slide) => slide.id !== activeSlide);
      setSlides(remainingSlides);

      // ✅ Set next available slide or null if no slides remain
      setActiveSlide(remainingSlides.length > 0 ? remainingSlides[0].id : null);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-screen p-4">
      {(userRole === "owner" || userRole === "editor") && (
        <div className="flex gap-2">
          <button
            onClick={handleAddSlide}
            className="bg-green-500 text-white p-2 rounded"
          >
            + Add Slide
          </button>
          <button
            onClick={handleDeleteSlide}
            className="bg-red-500 text-white p-2 rounded"
            disabled={slides.length <= 1} // ✅ Prevent deleting the last slide
          >
            🗑 Delete Slide
          </button>
        </div>
      )}

      {/* 🔹 Slide List */}
      <div className="w-full mt-4 flex flex-col space-y-2">
        {slides.map((slide) => (
          <button
            key={slide.id}
            className={`p-2 border rounded ${slide.id === activeSlide ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveSlide(slide.id)} // ✅ Click to switch slides
          >
            Slide {slides.indexOf(slide) + 1}
          </button>
        ))}
      </div>

      {/* 🔹 Active Slide Content */}
      <div className="relative border w-full h-[70vh] mt-4 bg-gray-100">
        {activeSlide && (
          <TextBlocksManager
            presentationId={presentationId}
            slideId={activeSlide}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
}
