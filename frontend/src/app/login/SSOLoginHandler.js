"use client";
import LoginForm from "@/components/LoginForm";
import { useSearchParams } from "next/navigation";

export default function SSOLoginHandler() {
    const searchParams = useSearchParams();
    const tokenFromAppA = searchParams.get('accessToken');

    console.log('Search Params:', Array.from(searchParams.entries()));

    return <LoginForm tokenFromAppA={tokenFromAppA} />;
}