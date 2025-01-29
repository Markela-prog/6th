import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { createSlide } from "./slides";

export const getPresentations = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "presentations"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching presentations: ", error);
    return [];
  }
};

export const createPresentation = async (title, creatorNickname) => {
  try {
    if (!title.trim() || !creatorNickname.trim()) {
      throw new Error("Presentation title and username cannot be empty.");
    }

    const docRef = await addDoc(collection(db, "presentations"), {
      title,
      createdBy: creatorNickname,
      createdAt: new Date().toISOString(),
      users: [
        {
          userId: creatorNickname,
          userNickname: creatorNickname,
          role: "owner",
        },
      ],
    });

    await createSlide(docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("Error creating presentation: ", error);
    return null;
  }
};

export const joinPresentation = async (
  presentationId,
  userNickname,
  role = "viewer"
) => {
  try {
    const presentationRef = doc(db, "presentations", presentationId);
    const docSnap = await getDoc(presentationRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      let users = data.users || [];

      const ownerExists = users.some((user) => user.role === "owner");

      const wasOwner = data.createdBy === userNickname;

      let newRole = role;
      if (!ownerExists) {
        newRole = "owner";
      } else if (wasOwner) {
        newRole = "owner";
      }

      const existingUserIndex = users.findIndex(
        (user) => user.userId === userNickname
      );

      if (existingUserIndex !== -1) {

        users[existingUserIndex].role = newRole;
      } else {

        users.push({ userId: userNickname, role: newRole });
      }

      await updateDoc(presentationRef, { users });

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error joining presentation: ", error);
    return false;
  }
};

export const leavePresentation = async (presentationId, userNickname) => {
  try {
    const presentationRef = doc(db, "presentations", presentationId);
    const docSnap = await getDoc(presentationRef);

    if (docSnap.exists()) {
      let users = docSnap.data().users || [];

      users = users.filter((user) => user.userId !== userNickname);

      await updateDoc(presentationRef, { users });

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error leaving presentation: ", error);
    return false;
  }
};

export const updateUserRole = async (presentationId, userId, newRole) => {
  try {
    const presentationRef = doc(db, "presentations", presentationId);
    const docSnap = await getDoc(presentationRef);

    if (docSnap.exists()) {
      let users = docSnap.data().users || [];

      users = users.map((user) =>
        user.userId === userId ? { ...user, role: newRole } : user
      );

      await updateDoc(presentationRef, { users });
    }
  } catch (error) {
    console.error("Error updating user role:", error);
  }
};
