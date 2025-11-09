import Chat from "./components/chat/Chat";
import Sidebar from "./components/layout/sidebar/Sidebar";
import { ConnectionsProvider } from "./context/ConnectionsContext";
import { SchemaProvider } from "./context/SchemaContext";

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
