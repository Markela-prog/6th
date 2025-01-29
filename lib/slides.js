import { db } from "./firebase";
import { doc, collection, addDoc, updateDoc, getDoc, getDocs, deleteDoc, onSnapshot } from "firebase/firestore";

export const createSlide = async (presentationId) => {
    try {
      const slideRef = await addDoc(collection(db, `presentations/${presentationId}/slides`), {
        elements: [],
      });
  
      console.log("New slide created:", slideRef.id); // ✅ Debugging
      return slideRef.id;
    } catch (error) {
      console.error("Error creating slide: ", error);
      return null;
    }
  };
  

/** ✅ Fetch all slides for a presentation */
export const getSlides = async (presentationId) => {
    try {
      const slidesSnapshot = await getDocs(collection(db, `presentations/${presentationId}/slides`));
      return slidesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching slides: ", error);
      return [];
    }
  };

/** ✅ Listen for real-time slide updates */
export const listenToSlides = (presentationId, callback) => {
    return onSnapshot(collection(db, `presentations/${presentationId}/slides`), (snapshot) => {
      const slides = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(slides);
    });
  };

/** ✅ Update slide content */
export const updateSlide = async (presentationId, slideId, elements) => {
  try {
    const slideRef = doc(db, `presentations/${presentationId}/slides`, slideId);
    await updateDoc(slideRef, { elements });
  } catch (error) {
    console.error("Error updating slide: ", error);
  }
};

/** ✅ Delete a slide */
export const deleteSlide = async (presentationId, slideId) => {
  try {
    const slideRef = doc(db, `presentations/${presentationId}/slides`, slideId);
    await deleteDoc(slideRef);
  } catch (error) {
    console.error("Error deleting slide: ", error);
  }
};

/** ✅ Add a text block to a slide */
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
  
  /** ✅ Update a text block (position, size, content) */
  export const updateTextBlock = async (presentationId, slideId, updatedBlock) => {
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
  
  /** ✅ Remove a text block */
  export const removeTextBlock = async (presentationId, slideId, blockId) => {
    try {
      const slideRef = doc(db, `presentations/${presentationId}/slides`, slideId);
      const slideSnap = await getDoc(slideRef);
  
      if (slideSnap.exists()) {
        const slideData = slideSnap.data();
        const updatedElements = slideData.elements.filter((block) => block.id !== blockId);
  
        await updateDoc(slideRef, { elements: updatedElements });
      }
    } catch (error) {
      console.error("Error removing text block:", error);
    }
  };