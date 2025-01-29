import { db } from "./firebase";
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";

export const createSlide = async (presentationId) => {
  try {
    const slidesCollection = collection(
      db,
      `presentations/${presentationId}/slides`
    );
    const existingSlidesSnapshot = await getDocs(slidesCollection);
    const slideCount = existingSlidesSnapshot.size;

    const newSlide = {
      title: `Slide ${slideCount + 1}`,
      elements: [],
      order: slideCount,
    };

    const slideRef = await addDoc(slidesCollection, newSlide);
    console.log("New slide created:", slideRef.id);

    return slideRef.id;
  } catch (error) {
    console.error("Error creating slide:", error);
    return null;
  }
};

export const getSlides = async (presentationId) => {
  try {
    const slidesQuery = query(
      collection(db, `presentations/${presentationId}/slides`),
      orderBy("order", "asc")
    );
    const slidesSnapshot = await getDocs(slidesQuery);
    return slidesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching slides: ", error);
    return [];
  }
};

export const listenToSlides = (presentationId, callback) => {
  return onSnapshot(
    collection(db, `presentations/${presentationId}/slides`),
    (snapshot) => {
      const slides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(slides);
    }
  );
};

export const updateSlide = async (presentationId, slideId, elements) => {
  try {
    const slideRef = doc(db, `presentations/${presentationId}/slides`, slideId);
    await updateDoc(slideRef, { elements });
  } catch (error) {
    console.error("Error updating slide: ", error);
  }
};

export const deleteSlide = async (presentationId, slideId) => {
  try {
    const slideRef = doc(db, `presentations/${presentationId}/slides`, slideId);
    await deleteDoc(slideRef);
  } catch (error) {
    console.error("Error deleting slide: ", error);
  }
};

export const addTextBlock = async (presentationId, slideId, newTextBlock) => {
  try {
    const slideRef = doc(db, `presentations/${presentationId}/slides`, slideId);
    const slideSnap = await getDoc(slideRef);

    if (slideSnap.exists()) {
      const slideData = slideSnap.data();
      const updatedElements = [...(slideData.elements || []), newTextBlock];

      await updateDoc(slideRef, { elements: updatedElements });
    }
  } catch (error) {
    console.error("Error adding text block:", error);
  }
};

export const updateTextBlock = async (
  presentationId,
  slideId,
  updatedBlock
) => {
  try {
    const slideRef = doc(db, `presentations/${presentationId}/slides`, slideId);
    const slideSnap = await getDoc(slideRef);

    if (slideSnap.exists()) {
      const slideData = slideSnap.data();
      const updatedElements = slideData.elements.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
      );

      await updateDoc(slideRef, { elements: updatedElements });
    }
  } catch (error) {
    console.error("Error updating text block:", error);
  }
};

export const removeTextBlock = async (presentationId, slideId, blockId) => {
  try {
    const slideRef = doc(db, `presentations/${presentationId}/slides`, slideId);
    const slideSnap = await getDoc(slideRef);

    if (slideSnap.exists()) {
      const slideData = slideSnap.data();
      const updatedElements = slideData.elements.filter(
        (block) => block.id !== blockId
      );

      await updateDoc(slideRef, { elements: updatedElements });
    }
  } catch (error) {
    console.error("Error removing text block:", error);
  }
};

export const addShapeBlock = async (presentationId, slideId, newShapeBlock) => {
  try {
    const slideRef = doc(db, `presentations/${presentationId}/slides`, slideId);
    const slideSnap = await getDoc(slideRef);

    if (slideSnap.exists()) {
      const slideData = slideSnap.data();
      const updatedElements = [...(slideData.elements || []), newShapeBlock];

      await updateDoc(slideRef, { elements: updatedElements });
    }
  } catch (error) {
    console.error("Error adding shape block:", error);
  }
};

export const updateSlideOrder = async (presentationId, orderedSlides) => {
  try {
    const batch = writeBatch(db);

    orderedSlides.forEach((slide, index) => {
      const slideRef = doc(
        db,
        `presentations/${presentationId}/slides`,
        slide.id
      );
      batch.update(slideRef, { order: index });
    });

    await batch.commit();
    console.log("Slide order updated:", orderedSlides);
  } catch (error) {
    console.error("Error updating slide order:", error);
  }
};

export const updateSlideTitle = async (presentationId, slideId, newTitle) => {
  try {
    const slideRef = doc(db, `presentations/${presentationId}/slides`, slideId);
    await updateDoc(slideRef, { title: newTitle });
  } catch (error) {
    console.error("Error updating slide title:", error);
  }
};
