import { Bell, MessageCircleQuestionMark, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <SidebarTrigger size="icon" />
      <div className="relative w-full min-w-0 max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search…"
          aria-label="Search"
          className="pl-9"
        />
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Help"
          title="Help"
        >
          <MessageCircleQuestionMark
            className="size-5"
            aria-hidden="true"
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="size-5" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="size-5" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
