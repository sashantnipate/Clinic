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
    const { isCollapsed, setCollapsed } = useSidebar();
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
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            
            {/* Left and Center branding segment */}
            <div className="flex items-center gap-1 sm:gap-4 min-w-0 flex-1 mr-4">
                <button
                    onClick={() => setCollapsed(!isCollapsed)}
                    className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors md:hidden text-foreground shrink-0"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="h-6 w-6" />
                </button>
                
                {/* 
                  - Completely removed `scale-110 sm:scale-125 origin-left` to stop visual layout bleeding.
                  - Adjusted responsive max-widths using standard Tailwind breakpoints.
                */}
                <div className="flex items-center min-w-0 max-w-[160px] min-[390px]:max-w-[200px] sm:max-w-[320px] md:max-w-[450px]">
                    <OrganizationSwitcher 
                        afterSelectOrganizationUrl={`/sync-workspace?redirect=${encodeURIComponent(pathname)}`}
                        appearance={{
                            elements: {
                                organizationSwitcherTrigger: "max-w-full min-w-0 flex items-center justify-between px-2 py-1 gap-1 border border-muted/40 rounded-lg hover:bg-muted/40 transition-colors",
                                organizationPreview: "min-w-0 flex-1",
                                organizationPreviewTextContainer: "min-w-0 flex-1 overflow-hidden",
                                organizationSwitcherTriggerTitle: "text-left overflow-hidden text-ellipsis whitespace-nowrap block w-full min-w-0 text-xs sm:text-sm font-semibold text-foreground",
                            }
                        }}
                    />
                </div>
            </div>

            {/* Right side system utility elements */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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