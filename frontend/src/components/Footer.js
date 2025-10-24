export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-700 text-white text-center py-3 mt-10 shadow-inner">
      <p className="text-sm">
        © {new Date().getFullYear()} RS St. Carolus – Semua hak dilindungi.
      </p>
    </footer>
  );
}
