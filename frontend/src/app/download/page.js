"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DownloadCenter() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [role, setRole] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil role user dari localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setRole(parsed.role?.toLowerCase());
    }
  }, []);

  // Ambil file asli dari backend
  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`); // ✅ ganti sesuai baseURL servermu
        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        console.error("Error fetching files:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, []);

  // Filter pencarian
  const filteredDocs = documents.filter((doc) => {
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || doc.type?.includes(filter.toLowerCase());
    return matchSearch && matchFilter;
  });

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar title="Download Center" />

      <main className="flex-grow p-6 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">File Center</h2>

            {/* ✅ Upload hanya untuk kepala unit & mitra bestari */}
            {(role === "kepala unit" || role === "mitra bestari") && (
              <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md cursor-pointer">
                + Upload File
                <input
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    const formData = new FormData();
                    formData.append("file", e.target.files[0]);
                    formData.append("uploaded_by", role);

                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/upload`, {
                      method: "POST",
                      body: formData,
                    });
                    // reload daftar file
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`);
                    setDocuments(await res.json());
                  }}
                />
              </label>
            )}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-6">
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg mb-2 sm:mb-0 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex space-x-2">
              {["All", "pdf", "docx", "xlsx"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === cat
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-semibold text-gray-800">{doc.name}</p>
                  <p className="text-sm text-gray-600">
                    {doc.size} • {doc.type}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {/* Semua role bisa download */}
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/api/files/download/${doc.id}`}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  >
                    Download
                  </a>

                  {/* ✅ Delete hanya untuk kepala unit & mitra bestari */}
                  {(role === "kepala unit" || role === "mitra bestari") && (
                    <button
                      onClick={async () => {
                        await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/files/${doc.id}`,
                          { method: "DELETE" }
                        );
                        // reload daftar file
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`);
                        setDocuments(await res.json());
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium shadow-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredDocs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No documents found.</p>
                <p className="text-gray-400 text-sm mt-1">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
