import Sidebar from "./SideBar.jsx";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}