export const exportSingleBatchPdf = async (batch) => {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Set document metadata
  doc.setProperties({
    title: `Arsip Batch Soal - ${batch.nama}`,
    subject: "Arsip Soal",
    author: "Sistem Manajemen Soal",
  });

  // Helper untuk check halaman baru
  const checkNewPage = (requiredSpace) => {
    if (y + requiredSpace > pageHeight - margin) {
      doc.addPage();
      addHeader();
      y = 30;
      return true;
    }
    return false;
  };

  // Header simple
  const addHeader = () => {
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(margin, 15, pageWidth - margin, 15);
    
    doc.setTextColor(41, 128, 185);
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("ARSIP BATCH SOAL", margin, 12);
    
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);
    const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
    doc.text(`Halaman ${pageNum}`, pageWidth - margin, 12, { align: "right" });
  };

  let y = 25;

  // Title Section
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text(batch.nama, margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(100, 100, 100);
  const date = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`Total: ${batch.soals.length} Soal | Tanggal: ${date}`, margin, y);
  y += 12;

  // Garis pembatas
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Function to load and compress image
  const loadAndCompressImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      img.onload = () => {
        // Create canvas untuk resize & compress
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Max width 600px (cukup untuk PDF)
        const maxWidth = 600;
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image ke canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert ke base64 dengan kompresi JPEG quality 0.6
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
        
        // Create new image dari compressed base64
        const compressedImg = new Image();
        compressedImg.onload = () => resolve(compressedImg);
        compressedImg.onerror = reject;
        compressedImg.src = compressedBase64;
      };
      
      img.onerror = reject;
      img.src = src;
    });
  };

  // Loop setiap soal
  for (let index = 0; index < batch.soals.length; index++) {
    const soal = batch.soals[index];

    // Check space untuk soal baru
    checkNewPage(25);

    // Nomor dan Pertanyaan
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    const questionText = `${index + 1}. ${soal.pertanyaan}`;
    const splitQuestion = doc.splitTextToSize(questionText, contentWidth);
    doc.text(splitQuestion, margin, y);
    y += splitQuestion.length * 5 + 5;

    // Gambar (jika ada)
    if (soal.gambar) {
      checkNewPage(50);
      
      try {
        const img = await loadAndCompressImage(
          `${process.env.NEXT_PUBLIC_API_URL}${soal.gambar}`
        );

        const imgWidth = 70;
        const imgHeight = 45;

        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.rect(margin + 5, y, imgWidth, imgHeight, "S");
        doc.addImage(img, "JPEG", margin + 5, y, imgWidth, imgHeight);
        y += imgHeight + 8;
      } catch (error) {
        console.warn("Failed to load image:", error);
      }
    }

    // Opsi jawaban - format text biasa
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    
    soal.opsi.forEach((opsi) => {
      checkNewPage(10);
      
      // Check apakah ini jawaban benar
      const isCorrect = opsi.kode === soal.jawabanBenar;
      
      if (isCorrect) {
        // Highlight hijau untuk jawaban benar
        doc.setFillColor(220, 240, 220);
        doc.roundedRect(margin + 3, y - 4, contentWidth - 6, 7, 1, 1, "F");
        doc.setTextColor(27, 94, 32);
        doc.setFont(undefined, "bold");
      } else {
        doc.setTextColor(60, 60, 60);
        doc.setFont(undefined, "normal");
      }
      
      const optionText = `${opsi.kode}. ${opsi.text}`;
      const splitOption = doc.splitTextToSize(optionText, contentWidth - 10);
      doc.text(splitOption, margin + 5, y);
      y += splitOption.length * 5 + 2;
    });

    y += 8;

    // Garis pemisah antar soal
    if (index < batch.soals.length - 1) {
      checkNewPage(8);
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
    }
  }

  // Add header to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeader();
  }

  // Save dengan filename yang clean
  const cleanName = batch.nama.replace(/[^a-z0-9]/gi, "_");
  doc.save(`Batch_${cleanName}.pdf`);
};