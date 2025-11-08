import Sidebar from "./components/layout/Sidebar";
import Chat from "./components/chat/Chat";
import { ConnectionsProvider } from "./context/ConnectionsContext";
import { SchemasProvider } from "./context/SchemaContext";

export default function Home() {
  return (
    <ConnectionsProvider>
      <SchemasProvider>
        <div className="flex h-screen w-full bg-white overflow-hidden">
          <Sidebar />
          <main className="flex-1 h-full">
            <Chat />
          </main>
        </div>
      </SchemasProvider>
    </ConnectionsProvider>
  );
}
