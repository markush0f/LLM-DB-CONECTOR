import Sidebar from "./components/layout/Sidebar";
import Chat from "./components/chat/Chat";

export default function Home() {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-full">
        <Chat />
      </main>
    </div>
  );
}
