'use client'
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useSidebar } from "./sidebar-context";

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const { toggleSidebar } = useSidebar();

    useEffect(() => {
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
        {/* Added 'relative' so absolute-positioned elements on mobile align to this container */}
        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-6 sm:px-6 lg:px-8">
            
            <div className="flex items-center gap-4">
                {/* Visible only on mobile, tucked securely to the left */}
                <button
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors md:hidden"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="h-6 w-6" />
                </button>
                
                {/* Standard alignment on desktop; perfectly centered on mobile screens */}
                <div className="scale-125 origin-left flex items-center max-md:absolute max-md:left-1/2 max-md:-translate-x-1/2">
                    <OrganizationSwitcher />
                </div>
            </div>

            {/* Stays on the right side on desktop; pinned to the right side on mobile */}
            <div className="flex items-center max-md:absolute max-md:right-6">
                <UserButton />
            </div>
            
        </div>
        </header>
    );
}