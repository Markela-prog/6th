"use client";
import { useEffect, useState } from "react";
import {
  getSlides,
  createSlide,
  deleteSlide,
  listenToSlides,
  updateSlideTitle,
  updateSlideOrder,
} from "@/lib/slides";
import { FilePlus, Trash2, GripVertical, Pencil } from "lucide-react";

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const removeDuplicates = (slides) => {
  const uniqueSlides = [];
  const seenIds = new Set();

  for (const slide of slides) {
    if (!seenIds.has(slide.id)) {
      uniqueSlides.push(slide);
      seenIds.add(slide.id);
    }
  }
  return uniqueSlides;
};

const SortableSlideItem = ({
  slide,
  index,
  activeSlide,
  setActiveSlide,
  updateTitle,
  userRole,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: slide.id });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(slide.title || `Slide ${index + 1}`);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${
        slide.id === activeSlide
          ? "bg-blue-500 text-white"
          : "bg-gray-100 hover:bg-gray-200"
      }`}
      onClick={() => setActiveSlide(slide.id)}
    >
      {/* Drag Handle */}
      <span {...listeners} className="cursor-grab">
        <GripVertical className="w-5 h-5" />
      </span>

      {/* Editable Title */}
      {userRole !== "viewer" && isEditing ? (
        <input
          className="flex-1 p-1 border rounded text-black bg-white placeholder-gray-500 focus:ring focus:ring-blue-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            updateTitle(slide.id, title);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
              updateTitle(slide.id, title);
            }
          }}
          autoFocus
        />
      ) : (
        <span className="flex-1 text-gray-800 font-medium" onDoubleClick={() => setIsEditing(true)}>
          {title}
        </span>
      )}

      {/* Edit Button */}
      <button onClick={() => setIsEditing(true)}>
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function SlidePanel({
  presentationId,
  setActiveSlide,
  activeSlide,
  userRole,
}) {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const fetchSlides = async () => {
      const slidesData = await getSlides(presentationId);
      setSlides(slidesData);
      if (slidesData.length > 0 && !activeSlide) {
        setActiveSlide(slidesData[0].id);
      }
    };

    fetchSlides();

    const unsubscribe = listenToSlides(presentationId, (updatedSlides) => {
      setSlides(updatedSlides.sort((a, b) => a.order - b.order));
    });

    return () => unsubscribe();
  }, [presentationId, activeSlide]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: closestCenter })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);

    const newSlides = [...slides];
    const [movedSlide] = newSlides.splice(oldIndex, 1);
    newSlides.splice(newIndex, 0, movedSlide);

    setSlides(newSlides);

    await updateSlideOrder(presentationId, newSlides);
  };

  const handleAddSlide = async () => {
    const newSlideId = await createSlide(presentationId);
    if (userRole === "owner") {
      if (newSlideId) {
        setSlides((prevSlides) =>
          removeDuplicates([
            ...prevSlides,
            {
              id: newSlideId,
              title: `Slide ${prevSlides.length + 1}`,
              elements: [],
            },
          ])
        );
        setActiveSlide(newSlideId);
      }
    }
  };

  const handleDeleteSlide = async () => {
    if (userRole === "owner") {
      if (activeSlide) {
        await deleteSlide(presentationId, activeSlide);
        setSlides((prevSlides) =>
          prevSlides.filter((slide) => slide.id !== activeSlide)
        );
      }
    }
  };
  const handleUpdateTitle = async (slideId, newTitle) => {
    await updateSlideTitle(presentationId, slideId, newTitle);
    setSlides((prevSlides) =>
      prevSlides.map((slide) =>
        slide.id === slideId ? { ...slide, title: newTitle } : slide
      )
    );
  };

  return (
    <div className="w-full md:w-1/1 min-w-[220px] bg-white shadow-lg p-4 border-r rounded-lg mt-3">
  <h2 className="text-lg font-semibold mb-3 text-gray-800">Slides</h2>

  {userRole === "viewer" ? (
    <div className="space-y-2">
      {slides.length > 0 ? (
        slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`p-2 border w-full rounded-lg font-medium transition ${
              slide.id === activeSlide
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            } transition`}
            onClick={() => setActiveSlide(slide.id)}
          >
            {slide.title || `Slide ${index + 1}`}
          </button>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No slides available</p>
      )}
    </div>
  ) : (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={slides.map((slide) => slide.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {slides.length > 0 ? (
            slides.map((slide, index) => (
              <SortableSlideItem
                key={slide.id}
                slide={slide}
                index={index}
                activeSlide={activeSlide}
                setActiveSlide={setActiveSlide}
                updateTitle={handleUpdateTitle}
                userRole={userRole}
              />
            ))
          ) : (
            <p className="text-gray-500 text-sm">No slides available</p>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )}



      {/* Buttons */}
      {userRole === "owner" && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleAddSlide}
            className="flex-1 bg-green-500 text-white p-2 rounded flex items-center justify-center gap-2"
          >
            <FilePlus className="w-5 h-5" /> Add Slide
          </button>

          {activeSlide && (
            <button
              onClick={handleDeleteSlide}
              className="bg-red-500 text-white p-2 rounded flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
