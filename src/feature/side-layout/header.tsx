'use client'
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function Header() {
    const[scrolled, setScrolled] = useState(false);

    useEffect(()=> {
        const onScroll = () => {
            setScrolled(window.scrollY > 10)
        };

        window.addEventListener("scroll", onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <header className={`fixed top-0 left-0 z-50 w-full h-16 ${
        scrolled
          ? "bg-white border-b shadow-sm"
          : "bg-background"
      }`}>
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 scale-125 origin-left">
            <OrganizationSwitcher />
            </div>

            <UserButton />
        </div>
        </header>
    );
}