'use client'
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Menu, Sun, Moon } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { toggleSidebar } = useSidebar();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        const onScroll = () => {
            setScrolled(window.scrollY > 10)
        };

        window.addEventListener("scroll", onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <header className={`fixed top-0 left-0 z-50 w-full h-16 transition-colors duration-200 ${
        scrolled
          ? "bg-white border-b shadow-sm dark:bg-background"
          : "bg-background"
      }`}>
        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-6 sm:px-6 lg:px-8">
            
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors md:hidden"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="h-6 w-6" />
                </button>
                
                <div className="scale-125 origin-left flex items-center max-md:absolute max-md:left-1/2 max-md:-translate-x-1/2">
                    <OrganizationSwitcher 
                        afterSelectOrganizationUrl={`/sync-workspace?redirect=${encodeURIComponent(pathname)}`}
                    />
                </div>
            </div>

            {/* Combined System Action Area */}
            <div className="flex items-center gap-4 max-md:absolute max-md:right-6">
                {mounted && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        aria-label="Toggle Theme"
                    >
                        {theme === "dark" ? (
                            <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
                        ) : (
                            <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
                        )}
                    </Button>
                )}
                <UserButton />
            </div>
            
        </div>
        </header>
    );
}