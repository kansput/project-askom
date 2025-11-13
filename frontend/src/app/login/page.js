"use client";
import LoginForm from "@/components/LoginForm";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();



  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/foto RS Carolus landscape 1.jpg')" }}
    >
      <LoginForm tokenFromAppA={searchParams.get('accessToken')} />
    </div>
  );
}