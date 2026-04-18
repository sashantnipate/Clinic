import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SignIn, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card>
        Auth created
      </Card>
      <SignOutButton/>
    </div>
  );
}
