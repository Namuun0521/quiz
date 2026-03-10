import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
const groups = [
  {
    label: "Yesterday",
    items: ["Genghis Khan"],
  },
  {
    label: "7 days",
    items: [
      "Figma ашиглах заавар",
      "Санхүүгийн шийдвэрүүд",
      "Figma-д загвар зохион бүтээх аргачлалууд",
    ],
  },
];

export function AppSidebar() {
  return (
    <div className="">
      <Sidebar className="w-70 border-none">
        <SidebarHeader />
        <div className=" border-slate-200 px-5 py-15 ">
          <div className="text-2xl font-semibold text-black">History</div>
        </div>
        <SidebarContent>
          <div className="px-2 py-3">
            {groups.map((group) => (
              <div key={group.label} className="mb-5">
                <div className="px-2 pb-2 text-[11px] font-medium text-slate-500">
                  {group.label}
                </div>

                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item}
                      className="w-full rounded-md px-3 py-2 text-left text-2xl text-black hover:bg-slate-50 transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <SidebarGroup />
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </div>
  );
}
