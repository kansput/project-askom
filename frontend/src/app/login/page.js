"use client";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/foto RS Carolus landscape 1.jpg')" }}
    >
      <LoginForm />
    </div>
  );
}
