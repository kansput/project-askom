"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CardItem from "@/components/CardItem";

export default function KepalaUnitDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [greetingIndex, setGreetingIndex] = useState(0);

  // Array sapaan multibahasa
  const greetings = ["Hello", "こんにちは", "Bonjour", "Hola", "Ciao", "안녕하세요", "Namaste", "Guten Tag", "你好", "Olá", "Привет", "Merhaba", "สวัสดี", "As-salamu alaykum", "Jambo", "Aloha", "Kia ora", "Hej", "Dobrý den", "Dzień dobry", "Γεια σας", "Buna ziua", "Zdravo", "Xin chào", "Sabaidee", "Mingalaba", "Vanakkam", "Talofa", "Mālō e lelei", "Sawubona", "Molo", "Tere", "Tungjatjeta", "Sain baina uu?", "Chào bạn", "Apa khabar?", "Halo"];

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/");
    } else {
      const parsed = JSON.parse(savedUser);
      if (parsed.role?.toLowerCase() !== "kepala unit") {
        router.push("/");
      } else {
        setUser(parsed);
      }
    }
  }, [router]);

  // Interval pergantian greeting (7 detik)
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [greetings.length]);

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  const currentGreeting = greetings[greetingIndex];
  const letters = currentGreeting.split("");

  // Variants animasi
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

  // Stats data (bisa diambil dari API nantinya)
  const stats = [
    {
      label: "Total Perawat",
      value: "24",
      change: "+3",
      trend: "up",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: "from-blue-500 to-blue-600"
    },
    {
      label: "Penilaian Pending",
      value: "8",
      change: "-2",
      trend: "down",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      gradient: "from-amber-500 to-orange-600"
    },
    {
      label: "Ujian Aktif",
      value: "3",
      change: "+1",
      trend: "up",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: "from-purple-500 to-purple-600"
    },
    {
      label: "Dokumen Kadaluarsa",
      value: "2",
      change: "0",
      trend: "neutral",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      gradient: "from-red-500 to-red-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar title="Dashboard Kepala Unit" />

      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Welcome Section - Enhanced */}
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
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {user.username || "Kepala Unit"}
                  </span>
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Kelola penilaian, ujian, dan data perawat di unit Anda dengan mudah
                </p>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="text-sm font-semibold">Kepala Unit</span>
              </div>
            </div>
          </div>
        </div>



        {/* Section 1: Penilaian - Enhanced */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-2.5 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Penilaian Perawat</h2>
                <p className="text-sm text-gray-600">Kelola penilaian keterampilan dan presentasi</p>
              </div>
            </div>
            <span className="hidden sm:inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
              2 Menu
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardItem image="/keterampilan-scoring.webp" title="Penilaian Keterampilan" href="/penilaian-keterampilan/" />
            <CardItem image="/presentation.webp" title="Penilaian Presentasi" href="/penilaian-presentasi/" />
          </div>
        </section>

        {/* Section 2: Hasil Penilaian - Enhanced */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-2.5 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Hasil Penilaian</h2>
                <p className="text-sm text-gray-600">Lihat hasil penilaian keterampilan dan presentasi</p>
              </div>
            </div>
            <span className="hidden sm:inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
              2 Menu
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardItem image="/keterampilan-hasil.webp" title="Hasil Penilaian Keterampilan" href="/hasil-keterampilan/" />
            <CardItem image="/presentation-hasil.webp" title="Hasil Penilaian Presentasi" href="/hasil-presentasi/" />
          </div>
        </section>

        {/* Section 3: Ujian - Enhanced */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Manajemen Ujian</h2>
                <p className="text-sm text-gray-600">Buat, kelola, dan mulai ujian perawat</p>
              </div>
            </div>
            <span className="hidden sm:inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
              4 Menu
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <CardItem image="/starting.png" title="Mulai Ujian" href="/ujian/create" />
            <CardItem image="/buat-soal.png" title="Form Pembuatan Ujian" href="/ujian/batchsoal/create" />
            <CardItem image="/books.png" title="Batch Soal Ujian" href="/ujian/batchsoal/" />
            <CardItem image="/ujian-selesai.png" title="Hasil Ujian" href="/dashboard/kepala-unit/submission" />
          </div>
        </section>

        {/* Section 4: Dokumen Perawat - Enhanced */}
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
                <p className="text-sm text-gray-600">Kelola dokumen STR, kredensial, dan sertifikat</p>
              </div>
            </div>
            <span className="hidden sm:inline-block bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">
              3 Menu
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardItem image="/str.jpg" title="Daftar Dokumen STR & SIP" href="/str-page/" />
            <CardItem image="/spkk.png" title="Daftar Dokumen Kredensial & SPKK" href="/kredokumen-page/" />
            <CardItem image="/badges.png" title="Daftar Sertifikat" href="/dashboard/kepala-unit/sertifikat-page/" />
          </div>
        </section>

        {/* Section 5: Management & Lainnya - Enhanced */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-2.5 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Management & Lainnya</h2>
                <p className="text-sm text-gray-600">Data perawat, jadwal, history, dan download</p>
              </div>
            </div>
            <span className="hidden sm:inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              2 Menu
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <CardItem image="/nurse.png" title="Daftar Perawat & Unit" href="/dashboard/kepala-unit/daftar-perawat" />
            <CardItem image="/file-center.png" title="File Center" href="/download/" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}