"use client";
import GameLobby from "@/components/games/GameLobby";

export default function GamesPage() {
  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-auto">
      <GameLobby />
    </div>
  );
}
