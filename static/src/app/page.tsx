import Chat from "./components/chat/Chat";
import Sidebar from "./components/layout/sidebar/Sidebar";
import ToastProvider from "./components/ui/ToastProvider";
import { ConnectionsProvider } from "./context/ConnectionsContext";
import { SchemaProvider } from "./context/SchemaContext";
import { SidebarProvider } from "./context/SidebarConnection";

export default function Home() {
  return (
    <SidebarProvider>
      <ConnectionsProvider>
        <SchemaProvider>
          <div className="flex h-screen w-full bg-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-full">
              <Chat />
            </main>
          </div>
          <ToastProvider />


        </SchemaProvider>
      </ConnectionsProvider>
    </SidebarProvider>
  );
}
