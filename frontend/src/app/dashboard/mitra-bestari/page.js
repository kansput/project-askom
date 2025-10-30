"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CardItem from "@/components/CardItem";

export default function MitraBestariDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [greetingIndex, setGreetingIndex] = useState(0);

  const greetings = [
    "Hello", "こんにちは", "Bonjour", "Hola", "Ciao", "안녕하세요", "Namaste", "Guten Tag",
    "你好", "Olá", "Привет", "Merhaba", "สวัสดี", "As-salamu alaykum", "Jambo", "Aloha",
    "Kia ora", "Hej", "Dobrý den", "Dzień dobry", "Γεια σας", "Buna ziua", "Zdravo",
    "Xin chào", "Sabaidee", "Mingalaba", "Vanakkam", "Talofa", "Mālō e lelei", "Sawubona",
    "Molo", "Tere", "Tungjatjeta", "Sain baina uu?", "Chào bạn", "Apa kabar?", "Halo"
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/");
    } else {
      const parsed = JSON.parse(savedUser);
      if (parsed.role?.toLowerCase() !== "mitra bestari") {
        router.push("/");
      } else {
        setUser(parsed);
      }
    }
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [greetings.length]);

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  const currentGreeting = greetings[greetingIndex];
  const letters = currentGreeting.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.02, staggerDirection: -1 },
    },
  };

  const child = {
    hidden: { opacity: 0, y: -20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
    exit: { opacity: 0, y: 20, scale: 0.8, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 flex flex-col">
      <Navbar title="Dashboard Mitra Bestari" />

      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex flex-wrap items-center gap-3">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={greetingIndex}
                      variants={container}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="inline-block"
                    >
                      {letters.map((letter, idx) => (
                        <motion.span key={idx} variants={child} className="inline-block">
                          {letter === " " ? "\u00A0" : letter}
                        </motion.span>
                      ))}
                    </motion.span>
                  </AnimatePresence>
                  <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    {user.username || "Mitra Bestari"}
                  </span>
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Anda dapat mengelola dokumen, mengikuti ujian, dan juga melakukan penilaian
                </p>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                </svg>
                <span className="text-sm font-semibold">Mitra Bestari</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Dokumen Perawat */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-2.5 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Dokumen Perawat</h2>
                <p className="text-sm text-gray-600">Kelola dokumen STR, kredensial, dan sertifikat Anda</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardItem image="/str.jpg" title="Permohonan Kredensial & SPKK" href="/dashboard/perawat/dokumen" />
            <CardItem image="/spkk.png" title="Upload Dokumen STR & SIP" href="/dashboard/perawat/str" />
            <CardItem image="/badges.png" title="Upload Sertifikat" href="/dashboard/perawat/sertifikat" />
          </div>
        </section>

        {/* Section 2: Ujian */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Ujian Askom</h2>
                <p className="text-sm text-gray-600">Ikuti ujian dan lihat hasil Anda</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardItem image="/starting.png" title="Ujian Askom" href="/dashboard/perawat/askom" />
          </div>
        </section>

        {/* Section 3: Penilaian */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-2.5 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Penilaian</h2>
                <p className="text-sm text-gray-600">Lakukan penilaian keterampilan dan presentasi</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardItem image="/keterampilan-scoring.webp" title="Penilaian Keterampilan" href="/penilaian-keterampilan/" />
            <CardItem image="/presentation.webp" title="Penilaian Presentasi" href="/penilaian-presentasi/" />
          </div>
        </section>

        {/* Section 4: Unduhan */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-2.5 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Unduhan</h2>
                <p className="text-sm text-gray-600">Akses file dan panduan Anda</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardItem image="/file-center.png" title="File Center" href="/download/" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
