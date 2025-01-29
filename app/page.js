"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPresentations,
  joinPresentation,
  createPresentation,
} from "../lib/presentation";

export default function Home() {
  const [presentations, setPresentations] = useState([]);
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPresentations();
      setPresentations(data);
    };

    fetchData();
  }, []);

  const handleCreatePresentation = async () => {
    if (!nickname.trim()) {
      alert("Please enter a nickname before creating a presentation.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title for the presentation.");
      return;
    }

    sessionStorage.setItem("nickname", nickname);

    const presentationId = await createPresentation(title, nickname);
    if (presentationId) {
      await joinPresentation(presentationId, nickname, "owner");
      router.push(`/presentation/${presentationId}`);
    }
  };

  const handleJoin = async (presentationId, role) => {
    if (!nickname.trim()) {
      alert("Please enter a nickname before joining.");
      return;
    }

    sessionStorage.setItem("nickname", nickname);

    const data = presentations.find((p) => p.id === presentationId);
    if (!data) return;

    const success = await joinPresentation(presentationId, nickname, role);
    if (success) {
      router.push(`/presentation/${presentationId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Collaborative Presentation</h1>

      {/* Nickname Input */}
      <input
        type="text"
        placeholder="Enter your nickname"
        className="p-2 border rounded mb-4 w-64"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />

      {/* Create Presentation Section */}
      <div className="flex flex-col items-center mb-6">
        <input
          type="text"
          placeholder="Enter presentation title"
          className="p-2 border rounded mb-2 w-64"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          onClick={handleCreatePresentation}
          className="bg-green-500 text-white p-2 rounded w-64"
        >
          Create Presentation
        </button>
      </div>

      {/* List of Presentations */}
      <ul className="w-full max-w-md">
        {presentations.map((presentation) => {
          const isOwner = nickname && presentation.createdBy === nickname;

          return (
            <li
              key={presentation.id}
              className="p-3 border-b flex justify-between items-center"
            >
              <span className="font-semibold">{presentation.title}</span>

              <div className="space-x-2">
                {isOwner ? (
                  <button
                    onClick={() => handleJoin(presentation.id, "owner")}
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleJoin(presentation.id, "viewer")}
                      className="bg-gray-400 text-white p-2 rounded"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleJoin(presentation.id, "editor")}
                      className="bg-blue-500 text-white p-2 rounded"
                    >
                      Join as Editor
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
