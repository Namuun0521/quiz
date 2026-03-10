import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export default function Layout() {
  return (
    <SidebarProvider className="w-fit bg-white">
      <AppSidebar />
      <main>
        <SidebarTrigger className="w-20" />
      </main>
    </SidebarProvider>
  );
}
