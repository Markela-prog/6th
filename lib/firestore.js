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
          userId: creatorNickname, // ✅ Ensure userId is stored correctly
          userNickname: creatorNickname,
          role: "owner", // ✅ Explicitly set as "owner"
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

      const existingUserIndex = users.findIndex(
        (user) => user.userId === userNickname
      );

      if (existingUserIndex !== -1) {
        // ✅ Keep the existing role (so we don’t override an editor’s role)
        console.log(
          `User ${userNickname} is already in the presentation with role: ${users[existingUserIndex].role}`
        );
      } else {
        users.push({ userId: userNickname, role });
        console.log(`User ${userNickname} joined as ${role}`);
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
