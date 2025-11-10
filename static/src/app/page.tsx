import Chat from "./components/chat/Chat";
import Sidebar from "./components/layout/sidebar/Sidebar";
import { ConnectionsProvider } from "./context/ConnectionsContext";
import { SchemaProvider } from "./context/SchemaContext";
import { SidebarProvider } from "./context/SidebarConnection";
import { ToastContainer, toast } from 'react-toastify';

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
          <ToastContainer
            aria-label="Notification system"
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
          />


        </SchemaProvider>
      </ConnectionsProvider>
    </SidebarProvider>
  );
}
