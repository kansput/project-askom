export const handleExportPDF = async (item) => {
    try {
        const { jsPDF } = await import("jspdf");
        const { autoTable } = await import("jspdf-autotable");

        // === HELPER FUNCTIONS ===
        const formatDate = (dateString) => {
            if (!dateString) return "-";
            const date = new Date(dateString);
            return date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        };

        const calculateGrade = (nilaiAkhir) => {
            if (nilaiAkhir >= 3.5) return "A";
            if (nilaiAkhir >= 3.0) return "B";
            if (nilaiAkhir >= 2.5) return "C";
            return "D";
        };

        const getStatusText = (status) => {
            switch (status) {
                case "draft": return "Draft";
                case "selesai": return "Selesai";
                case "final": return "Final";
                default: return status;
            }
        };

        // === INISIALISASI PDF ===
        const doc = new jsPDF("p", "mm", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const primaryColor = [22, 100, 160];
        const grayColor = [100, 100, 100];
        const margin = 14;

        // === LOAD LOGO ===
        const logoPath = "/st.carolus.png";
        const logoImg = new Image();
        logoImg.src = logoPath;

        await new Promise((resolve, reject) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => reject(new Error("Logo tidak ditemukan!"));
        });

        // === HEADER ===
        const addHeader = () => {
            doc.addImage(logoImg, "PNG", margin, 10, 40, 30);

            doc.setFontSize(13);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...primaryColor);
            const title = "LAPORAN EVALUASI KETERAMPILAN / PROSEDUR TINDAKAN KEPERAWATAN";
            const splitTitle = doc.splitTextToSize(title, pageWidth - margin * 2);
            doc.text(splitTitle, pageWidth / 2, 45, { align: "center" });

            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(80, 80, 80);
            doc.text(
                "Sistem Re-Kredensial Keperawatan - Rumah Sakit St. Carolus",
                pageWidth / 2,
                53,
                { align: "center" }
            );
        };

        // === FOOTER ===
        const addFooter = () => {
            const now = new Date();
            const tanggalCetak = now.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
            const jamCetak = now.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });

            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            const footerLineY = pageHeight - 25;
            doc.line(margin, footerLineY, pageWidth - margin, footerLineY);

            doc.setFontSize(8);
            doc.setTextColor(...grayColor);
            doc.setFont("helvetica", "italic");

            doc.text(
                "Dokumen ini dihasilkan secara otomatis oleh Sistem Re-Kredensial Keperawatan",
                margin,
                footerLineY + 5
            );
            doc.text(
                `Dicetak: ${tanggalCetak}, ${jamCetak} WIB`,
                margin,
                footerLineY + 10
            );

            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(9);
            doc.text(
                `Halaman ${doc.internal.getCurrentPageInfo().pageNumber} dari ${pageCount}`,
                pageWidth - margin,
                footerLineY + 10,
                { align: "right" }
            );
        };

        // === HEADER UTAMA ===
        addHeader();

        // === IDENTITAS ===
        const startY = 65;
        const lineHeight = 6;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);

        const labelX = margin;
        const valueX = margin + 28;
        const rightLabelX = pageWidth / 2 + 15;
        const rightValueX = rightLabelX + 28;

        const printField = (label, value, y, xLabel, xValue) => {
            doc.text(label, xLabel, y);
            doc.text(":", xValue - 3, y);
            doc.text(value || "-", xValue, y);
        };

        printField("Nama", item.perawatKeterampilan?.username, startY, labelX, valueX);
        printField("Unit", item.perawatKeterampilan?.unit, startY + lineHeight, labelX, valueX);
        printField("Prosedur", item.prosedur, startY + lineHeight * 2, labelX, valueX);
        printField("NPK", item.perawat_npk, startY, rightLabelX, rightValueX);
        printField("Tanggal", formatDate(item.tanggal_penilaian), startY + lineHeight, rightLabelX, rightValueX);

        // === NILAI KOMPONEN ===
        let nilaiKomponen = [];
        try {
            nilaiKomponen = typeof item.nilai_komponen === "string"
                ? JSON.parse(item.nilai_komponen)
                : item.nilai_komponen || [];
        } catch {
            nilaiKomponen = [];
        }

        const getNilai = (noKomponen) => {
            const komponen = nilaiKomponen.find(k => k.no === noKomponen || k.nomor === noKomponen);
            return komponen?.nilai || komponen?.score || "-";
        };

        const hitungBobotXNilai = (bobot, nilai) => {
            if (nilai === "-" || isNaN(nilai)) return "-";
            return (parseFloat(bobot) * parseFloat(nilai)).toFixed(2);
        };

        const komponenPenilaian = [
            ["1.1", "Menilai kembali kebutuhan perawatan pasien", "1", getNilai("1.1"), hitungBobotXNilai("1", getNilai("1.1"))],
            ["2.1", "Menetapkan cara pelaksanaan tindakan", "1", getNilai("2.1"), hitungBobotXNilai("1", getNilai("2.1"))],
            ["3.1", "Menyiapkan alat sesuai tindakan", "1", getNilai("3.1"), hitungBobotXNilai("1", getNilai("3.1"))],
            ["3.2", "Menjelaskan tujuan dan alasan:\n• Menyiapkan lingkungan yang memadai\n• Melakukan prosedur perawatan sesuai langkah & teknik\n• Mencegah komplikasi akibat prosedur\n• Melakukan perawatan dengan lembut", "10", getNilai("3.2"), hitungBobotXNilai("10", getNilai("3.2"))],
            ["3.3", "Mengumpulkan alat & kembalikan", "1", getNilai("3.3"), hitungBobotXNilai("1", getNilai("3.3"))],
            ["4.1", "Mengobservasi reaksi pasien", "1", getNilai("4.1"), hitungBobotXNilai("1", getNilai("4.1"))],
            ["4.2", "Melakukan komunikasi selama tindakan", "1", getNilai("4.2"), hitungBobotXNilai("1", getNilai("4.2"))],
        ];

        // === FUNGSI AUTO-TABLE CENTER ===
        const centeredTable = (doc, options = {}) => {
            const tableWidth = 12 + 95 + 15 + 15 + 20;
            const startX = (pageWidth - tableWidth) / 2;
            return autoTable(doc, {
                ...options,
                margin: { left: startX, right: startX },
            });
        };

        // === TABEL PENILAIAN ===
        centeredTable(doc, {
            startY: startY + lineHeight * 3 + 8,
            head: [["No", "Komponen Penilaian", "Bobot", "Nilai", "Bobot × Nilai"]],
            body: komponenPenilaian.map(r => [
                r[0],
                r[1].replace(/\n/g, " "),
                r[2],
                r[3],
                r[4]
            ]),
            theme: "grid",
            styles: {
                fontSize: 9,
                cellPadding: 3,
                lineColor: [200, 200, 200],
                lineWidth: 0.2,
                minCellHeight: 8,
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontStyle: "bold",
                halign: "center",
            },
            bodyStyles: { valign: "middle" },
            columnStyles: {
                0: { cellWidth: 12, halign: "center" },
                1: { cellWidth: 95, valign: "top" },
                2: { cellWidth: 15, halign: "center" },
                3: { cellWidth: 15, halign: "center" },
                4: { cellWidth: 20, halign: "center" },
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        // === BAGIAN NILAI DAN KETERANGAN ===
        const bottomY = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Keterangan Nilai:", margin, bottomY);

        doc.setFont("helvetica", "normal");
        const ketY = bottomY + 4;
        const ls = 4;
        doc.text("4 = Baik sekali", margin, ketY);
        doc.text("3 = Baik", margin, ketY + ls);
        doc.text("2 = Cukup", margin, ketY + ls * 2);
        doc.text("1 = Kurang", margin, ketY + ls * 3);

        const rightX = pageWidth - margin;
        const nilaiAkhir = parseFloat(item.nilai_akhir || 0).toFixed(2);
        const grade = item.grade || calculateGrade(parseFloat(item.nilai_akhir));
        const statusText = getStatusText(item.status);

        const rs = 5;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);

        doc.text(`Nilai Akhir/16 : ${nilaiAkhir}`, rightX, bottomY, { align: "right" });
        doc.text(`Grade          : ${grade}`, rightX, bottomY + rs, { align: "right" });
        doc.text(`Status Kelulusan : ${statusText}`, rightX, bottomY + rs * 2, { align: "right" });

        // === TANDA TANGAN ===
        const signY = Math.max(ketY + ls * 3, bottomY + rs * 2) + 15;
        const nameY = signY + 20;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);

        doc.text("Penguji,", margin, signY);
        doc.text(`( ${item.penilaiKeterampilan?.username || ".............................."} )`, margin, nameY);

        doc.text("Kepala Unit,", rightX, signY, { align: "right" });
        doc.text("( .............................. )", rightX, nameY, { align: "right" });

        // === FOOTER PER HALAMAN ===
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            addFooter();
        }

        // === OUTPUT ===
        const pdfUrl = doc.output("bloburl");
        window.open(pdfUrl, "_blank");
    } catch (err) {
        console.error("Error generating PDF:", err);
        alert("Gagal membuat PDF. Pastikan logo ada di folder /public.");
    }
};
