export const exportBatchSoalOnlyPdf = async (batch) => {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let y = 25;

  // Header
  const addHeader = () => {
    doc.setDrawColor(41, 128, 185);
    doc.line(margin, 15, pageWidth - margin, 15);
    doc.setFontSize(11);
    doc.setTextColor(41, 128, 185);
    doc.text("BANK SOAL (TANPA JAWABAN)", margin, 12);
  };

  addHeader();

  // Judul
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  doc.setFont(undefined, "bold");
  doc.text(batch.nama, margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Total Soal: ${batch.soals.length}`, margin, y);
  y += 12;

  // Garis
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Loop soal
  batch.soals.forEach((soal, index) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      addHeader();
      y = 30;
    }

    // Pertanyaan
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    const q = `${index + 1}. ${soal.pertanyaan}`;
    const qSplit = doc.splitTextToSize(q, contentWidth);
    doc.text(qSplit, margin, y);
    y += qSplit.length * 5 + 4;

    // Opsi (TANPA tahu mana yang benar)
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    soal.opsi.forEach((opsi) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        addHeader();
        y = 30;
      }

      const opt = `${opsi.kode}. ${opsi.text}`;
      const optSplit = doc.splitTextToSize(opt, contentWidth - 10);
      doc.text(optSplit, margin + 5, y);
      y += optSplit.length * 5 + 2;
    });

    y += 8;
  });

  const cleanName = batch.nama.replace(/[^a-z0-9]/gi, "_");
  doc.save(`Batch_${cleanName}_SOAL_ONLY.pdf`);
};
