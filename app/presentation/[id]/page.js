"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { joinPresentation, leavePresentation } from "@/lib/presentation";
import SlidePanel from "@/app/components/SlidePanel";
import UserPanel from "@/app/components/UserPanel";
import TopToolbar from "@/app/components/TopToolBar";
import SlideCanvas from "@/app/components/SlideCanvas";
import PresentMode from "@/app/components/PresentMode";
import { addTextBlock, addShapeBlock, getSlides } from "@/lib/slides";
import { v4 as uuidv4 } from "uuid";

export default function PresentationPage() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [presentation, setPresentation] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [users, setUsers] = useState([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [activeSlide, setActiveSlide] = useState(null);
  const [slides, setSlides] = useState([]);

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

        const user = data.users.find((user) => user.userId === userNickname);
        if (user) {
          setUserRole(user.role);
        } else {
          sessionStorage.removeItem("nickname");
          router.push("/");
        }
      } else {
        router.push("/");
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

  useEffect(() => {
    if (!id) return;
    const fetchSlides = async () => {
      const fetchedSlides = await getSlides(id);
      setSlides(removeDuplicates(fetchedSlides));
      if (fetchedSlides.length > 0 && !activeSlide) {
        setActiveSlide(fetchedSlides[0].id);
      }
    };
    fetchSlides();
  }, [id]);

  if (!presentation) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Loading presentation...
      </div>
    );
  }

  if (isPresenting) {
    return (
      <PresentMode
        presentation={presentation}
        slides={slides}
        onExit={() => setIsPresenting(false)}
      />
    );
  }

  const handleAddText = async () => {
    if (userRole !== "viewer" && activeSlide) {
      const newBlock = {
        id: uuidv4(),
        type: "text",
        content: "New Text",
        position: { x: 50, y: 50 },
        size: { width: 200, height: 50 },
      };
      await addTextBlock(id, activeSlide, newBlock);
    }
  };

  const handleAddShape = async (shapeType) => {
    if (userRole !== "viewer" && activeSlide) {
      const newBlock = {
        id: uuidv4(),
        type: "shape",
        shape: shapeType,
        color: "blue",
        position: { x: 100, y: 100 },
        size: { width: 100, height: 100 },
      };
      await addShapeBlock(id, activeSlide, newBlock);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Toolbar */}
      <TopToolbar
        onAddText={handleAddText}
        onAddShape={handleAddShape}
        onPresent={() => setIsPresenting(true)}
        userRole={userRole}
      />

      <div className="flex flex-grow flex-wrap overflow-hidden">
        {/* Slide Panel (Left Sidebar) */}
        <div className="w-full md:w-1/5 min-w-[220px]">
          <SlidePanel
            presentationId={id}
            setActiveSlide={setActiveSlide}
            activeSlide={activeSlide}
            userRole={userRole}
          />
        </div>

        {/* Slide Canvas (Main Editing Area) */}
        <div className="flex-1 flex justify-center items-center p-2 min-w-[300px]">
          <SlideCanvas
            presentationId={id}
            slideId={activeSlide}
            userRole={userRole}
          />
        </div>

        {/* User Panel (Right Sidebar) */}
        <div className="w-full md:w-1/5 min-w-[200px]">
          <UserPanel users={users} presentationId={id} userRole={userRole} />
        </div>
      </div>
    </div>
  );
}
