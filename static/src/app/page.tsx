import Sidebar from "./components/layout/Sidebar";
import Chat from "./components/chat/Chat";
import { SchemaProvider } from "./context/SchemaContext";
import { ConnectionsProvider } from "./context/ConnectionsContext";

export default function Home() {
  return (
    <ConnectionsProvider>
      <SchemaProvider>
        <div className="flex h-screen w-full bg-white overflow-hidden">
          <Sidebar />
          <main className="flex-1 h-full">
            <Chat />
          </main>
        </div>
      </SchemaProvider>
    </ConnectionsProvider>
  );
}
