
import SSOLoginHandler from "./SSOLoginHandler";
import { Suspense } from "react"; 

export default function LoginPage() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/foto RS Carolus landscape 1.jpg')" }}
    >

      <Suspense fallback={<div className="text-xl text-white">Loading...</div>}>
        <SSOLoginHandler />
      </Suspense>
    </div>
  );
}