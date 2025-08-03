import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SidebarToggleButton({ showSidebar, setShowSidebar }) {
  return (
    <button
      onClick={() => setShowSidebar(!showSidebar)}
      className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
      aria-label={showSidebar ? "Close sidebar" : "Open sidebar"}
    >
      {showSidebar ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
}