// utils/exportUjianPDF.js
import { toast } from "react-hot-toast";

export const handleExportPDFUjian = async (item) => {
    try {
        const { jsPDF } = await import("jspdf");
        const { autoTable } = await import("jspdf-autotable");

        const doc = new jsPDF("p", "mm", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;

        // Logo
        const logoImg = new Image();
        logoImg.src = "/st.carolus.png";
        await new Promise((resolve) => { logoImg.onload = resolve; });

        // Header
        doc.addImage(logoImg, "PNG", margin, 10, 38, 28);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 100, 160);
        doc.text("HASIL UJIAN TEORI KEPERAWATAN", pageWidth / 2, 45, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 100, 100);
        doc.text("Sistem Re-Kredensial Keperawatan - RS St. Carolus", pageWidth / 2, 52, { align: "center" });

        let y = 65;
        const add = (text, size = 11, bold = false) => {
            doc.setFontSize(size);
            doc.setFont("helvetica", bold ? "bold" : "normal");
            doc.text(text, margin, y);
            y += 7;
        };

        add(`Ujian           : ${item.ujianJudul}`, 11, true);
        add(`Deskripsi       : ${item.ujianDeskripsi || "-"}`);
        add(`Periode         : ${new Date(item.waktuMulai).toLocaleString("id-ID")} - ${new Date(item.waktuSelesai).toLocaleString("id-ID")}`);
        y += 5;
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        add("DATA PESERTA", 12, true);
        add(`Nama            : ${item.nama}`);
        add(`Unit            : ${item.unit}`);
        add(`Status Kelulusan: ${item.status.toUpperCase()}`, 11, true);

        y += 10;
        add("HASIL PENILAIAN", 12, true);
        add(`Skor Akhir      : ${item.skor} / 100`, 14, true);
        add(`Exit Fullscreen : ${item.exitAttempts} kali`, 10);
        add(`Pindah Tab      : ${item.tabSwitchCount} kali`, 10);

        // Footer
        const now = new Date().toLocaleString("id-ID", {
            day: "2-digit", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Dicetak pada: ${now}`, margin, 280);

        // Tanda tangan
        doc.text("Penguji,", margin, 250);
        doc.text("(..................................)", margin, 265);
        doc.text("Kepala Unit,", pageWidth - margin, 250, { align: "right" });
        doc.text("(..................................)", pageWidth - margin, 265, { align: "right" });

        const safeName = item.nama.replace(/[^a-z0-9]/gi, "_");
        doc.save(`Hasil_Ujian_${safeName}_${item.ujianJudul.slice(0, 20)}.pdf`);
        toast.success("PDF berhasil diunduh!");
    } catch (err) {
        console.error(err);
        toast.error("Gagal generate PDF. Pastikan logo ada di /public/st.carolus.png");
    }
};