"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { joinPresentation, leavePresentation } from "@/lib/firestore";
import SlideEditor from "@/app/components/SlideEditor";

export default function PresentationPage() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [presentation, setPresentation] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [users, setUsers] = useState([]);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const userNickname = sessionStorage.getItem("nickname");

    if (!userNickname) {
      router.push("/");
      return;
    }

    if (!id) return;

    const docRef = doc(db, "presentations", id);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPresentation(data);
        setUsers(data.users || []);

        // ✅ Ensure correct role is set
        const user = data.users.find((user) => user.userId === userNickname);
        if (user) {
          console.log("User role found:", user.role); // ✅ Debugging user role
          setUserRole(user.role);
        } else {
          console.log("No user role found. Defaulting to viewer.");
          setUserRole("viewer");
        }
      }
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const userNickname = sessionStorage.getItem("nickname");
    const userRole = sessionStorage.getItem("userRole");

    if (!userNickname) {
      router.push("/");
      return;
    }

    const joinUser = async () => {
      if (id && userNickname && userRole && !hasJoined) {
        await joinPresentation(id, userNickname, userRole);
        setHasJoined(true);
      }
    };

    joinUser();

    const handleLeave = async () => {
      if (id && userNickname) {
        await leavePresentation(id, userNickname);
      }
    };

    window.addEventListener("beforeunload", handleLeave);
    window.addEventListener("popstate", handleLeave);
    window.addEventListener("pushstate", handleLeave);

    return () => {
      window.removeEventListener("beforeunload", handleLeave);
      window.removeEventListener("popstate", handleLeave);
      window.removeEventListener("pushstate", handleLeave);

      if (!window.location.pathname.includes(`/presentation/${id}`)) {
        handleLeave();
      }
    };
  }, [id, pathname, hasJoined]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {presentation ? (
        <>
          <h1 className="text-3xl font-bold">{presentation.title}</h1>
          <p>Created by: {presentation.createdBy}</p>
          <p className="font-semibold">Your role: {userRole}</p>

          {/* 🔹 Active Users List */}
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Active Users:</h2>
            <ul>
              {users.map((user, index) => (
                <li key={index} className="text-gray-700">
                  {user.userId} -{" "}
                  <span className="text-sm text-gray-500">{user.role}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 🔹 Slide Editor Component (Placed Below Users List) */}
          <div className="w-full mt-6">
            <SlideEditor presentationId={id} userRole={userRole} />
          </div>

          {/* 🔹 Role-Based Messages */}
          {userRole === "viewer" ? (
            <p className="mt-4 text-gray-600">
              You are in viewer mode. You cannot edit.
            </p>
          ) : userRole === "owner" ? (
            <p className="mt-4 text-green-600 font-bold">
              You are the owner. You have full control.
            </p>
          ) : (
            <p className="mt-4 text-gray-600">
              You are an editor. Editing features will be added.
            </p>
          )}
        </>
      ) : (
        <p>Loading presentation...</p>
      )}
    </div>
  );
}
