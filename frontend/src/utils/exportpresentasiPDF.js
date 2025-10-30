// utils/exportpresentasiPDF.js
export const handleExportPresentasiPDF = async (item) => {
    try {
        const { jsPDF } = await import("jspdf");
        const { autoTable } = await import("jspdf-autotable");

        const doc = new jsPDF("p", "mm", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const primaryColor = [22, 100, 160];
        const grayColor = [100, 100, 100];

        // === HEADER ===
        const logo = new Image();
        logo.src = "/st.carolus.png";
        await new Promise((res) => (logo.onload = res));
        doc.addImage(logo, "PNG", margin, 10, 40, 30);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.setFontSize(13);
        doc.text("Laporan Evaluasi Presentasi Kasus Asuhan Keperawatan / Kebidanan", pageWidth / 2, 45, { align: "center" });
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(
            "Sistem Re-Kredensial Keperawatan - Rumah Sakit St. Carolus",
            pageWidth / 2,
            53,
            { align: "center" }
        );

        // === IDENTITAS ===
        const fmt = (d) =>
            d
                ? new Date(d).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })
                : "-";
        const startY = 65,
            lh = 6;
        const labelX = margin,
            valX = margin + 28;
        const rightLabelX = pageWidth / 2 + 15,
            rightValX = rightLabelX + 28;
        const f = (label, value, y, xl, xv) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.text(label, xl, y);
            doc.text(":", xv - 3, y);
            doc.text(String(value ?? "-"), xv, y);
        };
        f("Nama", item?.perawat?.username, startY, labelX, valX);
        f("Unit", item?.perawat?.unit, startY + lh, labelX, valX);
        f("Topik", item?.topik, startY + lh * 2, labelX, valX);
        f("NPK", item?.perawat_npk, startY, rightLabelX, rightValX);
        f("Tanggal", fmt(item?.tanggal_presentasi), startY + lh, rightLabelX, rightValX);

        // === PARSING NILAI ===
        const parseNilai = (raw) => {
            try {
                const arr = JSON.parse(raw || "[]");
                return Array.isArray(arr) && Array.isArray(arr[0]) ? arr.flat() : arr;
            } catch {
                return [];
            }
        };
        const nilai1 = parseNilai(item?.nilai_penguji1);
        const nilai2 = parseNilai(item?.nilai_penguji2);
        const getNilai = (kode, src) => src.find((x) => x.no === kode)?.nilai ?? "-";

        // === BAGIAN PENILAIAN ===
        const sections = [
            { title: "A. Makalah / Laporan Kasus (Bobot: 1)", range: ["A.1", "A.2", "A.3"] },
            { title: "BI. Persiapan Presentasi (Bobot: 0.5)", range: ["BI.1", "BI.2", "BI.3"] },
            { title: "BII. Pelaksanaan Presentasi (Bobot: 1)", range: ["BII.1", "BII.2", "BII.3"] },
            { title: "BIII. Isi Presentasi (Bobot: 1)", range: ["BIII.1", "BIII.2", "BIII.3", "BIII.4", "BIII.5"] },
            { title: "BIV. Diskusi (Bobot: 1.5)", range: ["BIV.1", "BIV.2"] },
        ];

        let posY = startY + lh * 4 + 5;
        for (const section of sections) {
            if (posY > pageHeight - 60) {
                doc.addPage();
                posY = margin;
            }
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...primaryColor);
            doc.text(section.title, margin, posY);
            posY += 4;

            const body = section.range.map((no) => [
                no,
                nilai1.find((n) => n.no === no)?.komponen || "-",
                getNilai(no, nilai1),
                getNilai(no, nilai2),
            ]);

            autoTable(doc, {
                startY: posY,
                head: [["No", "Komponen Penilaian", "Penguji 1", "Penguji 2"]],
                body,
                theme: "grid",
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], halign: "center" },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    2: { halign: "center", cellWidth: 25 },
                    3: { halign: "center", cellWidth: 25 },
                },
            });
            posY = doc.lastAutoTable.finalY + 10;
        }

        // === BAGIAN KETERANGAN & NILAI TOTAL ===
        const rightX = pageWidth - margin;
        const leftX = margin;
        let y = posY;
        doc.setTextColor(0, 0, 0);

        // Keterangan Nilai (kiri)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Keterangan Nilai:", leftX, y);
        doc.setFont("helvetica", "normal");
        const ls = 5;
        doc.text("4 = Baik sekali", leftX, y + ls);
        doc.text("3 = Baik", leftX, y + ls * 2);
        doc.text("2 = Cukup", leftX, y + ls * 3);
        doc.text("1 = Kurang", leftX, y + ls * 4);

        // Nilai & Grade (kanan)
        const nilaiAkhir = parseFloat(item?.nilai_final ?? 0).toFixed(2);
        const grade = item?.grade ?? "-";
        const status = item?.status ?? "-";
        const total1 = item?.total_penguji1 ?? "-";
        const total2 = item?.total_penguji2 ?? "-";
        const rs = 6;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`Nilai Penguji 1 : ${total1}`, rightX, y, { align: "right" });
        doc.text(`Nilai Penguji 2 : ${total2}`, rightX, y + rs, { align: "right" });
        doc.text(`Nilai Akhir : ${nilaiAkhir}`, rightX, y + rs * 2, { align: "right" });
        doc.text(`Grade : ${grade}`, rightX, y + rs * 3, { align: "right" });
        doc.text(`Status : ${status}`, rightX, y + rs * 4, { align: "right" });

        // === TANDA TANGAN ===
        const signY = y + ls * 4 + 25;
        doc.setFont("helvetica", "normal");
        doc.text("Penguji 1,", margin, signY);
        doc.text("Penguji 2,", pageWidth / 2 + 40, signY);
        doc.text(`(${item?.penguji1?.username || "."})`, margin, signY + 20);
        doc.text(`(${item?.penguji2?.username || "."})`, pageWidth / 2 + 40, signY + 20);

        // === FOOTER ===
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            const now = new Date();
            const tanggal = now.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
            const waktu = now.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            });
            const fy = pageHeight - 25;
            doc.setDrawColor(200);
            doc.line(margin, fy, pageWidth - margin, fy);
            doc.setFontSize(8);
            doc.setTextColor(...grayColor);
            doc.setFont("helvetica", "italic");
            doc.text(
                "Dokumen ini dihasilkan secara otomatis oleh Sistem Re-Kredensial Keperawatan",
                margin,
                fy + 5
            );
            doc.text(`Dicetak: ${tanggal}, ${waktu} WIB`, margin, fy + 10);
            doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin, fy + 10, {
                align: "right",
            });
        }

        const url = doc.output("bloburl");
        window.open(url, "_blank");
    } catch (err) {
        console.error("Error generating PDF:", err);
        alert("Gagal membuat PDF presentasi");
    }
};
