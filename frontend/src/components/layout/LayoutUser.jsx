import { useState } from "react";
import Topbar from "./Topbar";
import UserSidebar from "./UserSidebar";
import Footer from "./Footer";

export default function LayoutUser({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-x-hidden font-sans">
      <UserSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar setIsSidebarOpen={setIsSidebarOpen} />

        <div className="flex-1 overflow-y-auto scroll-smooth">
          <main className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto animate-fade-in-up">
              {children}
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}
