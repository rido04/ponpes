// Data jurnal (dalam aplikasi nyata, ini bisa dari database)
const journals = [
  {
    id: 1,
    title: "Pengaruh Teknologi AI dalam Pendidikan",
    author: "Dr. Ahmad Fauzi, M.Kom",
    date: "15 Januari 2023",
    category: "Ilmu Komputer",
    description: "Penelitian tentang dampak penggunaan teknologi AI dalam metode pembelajaran modern.",
    pdfUrl: "pdfs/jurnal-ai-pendidikan.pdf",
  },
  {
    id: 2,
    title: "Studi Ekosistem Hutan Hujan Tropis",
    author: "Prof. Siti Rahayu, Ph.D",
    date: "2 Februari 2023",
    category: "Biologi",
    description: "Analisis keanekaragaman hayati dalam ekosistem hutan hujan tropis Indonesia.",
    pdfUrl: "pdfs/jurnal-ekosistem-hutan.pdf",
  },
  {
    id: 3,
    title: "Perkembangan Ekonomi Digital di Asia Tenggara",
    author: "Dr. Budi Santoso, S.E., M.Ec",
    date: "10 Maret 2023",
    category: "Ekonomi",
    description: "Tren dan pertumbuhan ekonomi digital di kawasan Asia Tenggara tahun 2022-2023.",
    pdfUrl: "pdfs/jurnal-ekonomi-digital.pdf",
  },
];

// Variabel PDF
let pdfDoc = null,
  pageNum = 1,
  pageRendering = false,
  pageNumPending = null,
  scale = 1.0,
  canvas = document.getElementById("pdf-render"),
  ctx = canvas.getContext("2d");

// Inisialisasi daftar jurnal di sidebar
function initJournalList() {
  const journalList = document.getElementById("journal-list");

  journals.forEach((journal) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <a href="#" data-id="${journal.id}" class="journal-link">
                <i class="fas fa-file-pdf"></i>
                ${journal.title}
            </a>
        `;
    journalList.appendChild(li);
  });

  // Tambahkan event listener untuk setiap link jurnal
  document.querySelectorAll(".journal-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const journalId = parseInt(this.getAttribute("data-id"));
      loadJournal(journalId);

      // Update active state
      document.querySelectorAll(".journal-link").forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Load jurnal pertama secara default
  if (journals.length > 0) {
    loadJournal(journals[0].id);
    document.querySelector(`.journal-link[data-id="${journals[0].id}"]`).classList.add("active");
  }
}

// Memuat jurnal berdasarkan ID
function loadJournal(journalId) {
  const journal = journals.find((j) => j.id === journalId);
  if (!journal) return;

  // Update informasi jurnal
  document.getElementById("journal-title").textContent = journal.title;
  document.getElementById("journal-author").textContent = journal.author;
  document.getElementById("journal-date").textContent = journal.date;
  document.getElementById("journal-category").textContent = journal.category;
  document.getElementById("journal-description").textContent = journal.description;

  // Load PDF
  loadPDF(journal.pdfUrl);
}

// Memuat dan menampilkan PDF
function loadPDF(url) {
  pdfjsLib
    .getDocument(url)
    .promise.then(function (pdfDoc_) {
      pdfDoc = pdfDoc_;
      document.getElementById("total-pages").textContent = pdfDoc.numPages;

      // Reset ke halaman pertama
      pageNum = 1;
      document.getElementById("current-page").textContent = pageNum;
      document.getElementById("zoom-percent").textContent = Math.round(scale * 100);

      // Render halaman pertama
      renderPage(pageNum);
    })
    .catch(function (error) {
      alert("Gagal memuat PDF: " + error.message);
    });
}

// Render halaman PDF
function renderPage(num) {
  pageRendering = true;

  pdfDoc.getPage(num).then(function (page) {
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    const renderTask = page.render(renderContext);

    renderTask.promise.then(function () {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  document.getElementById("current-page").textContent = num;
}

// Queue rendering halaman
function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

// Navigasi halaman sebelumnya
function onPrevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
}

// Navigasi halaman berikutnya
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
}

// Zoom in
function zoomIn() {
  if (scale >= 2.5) return;
  scale += 0.25;
  document.getElementById("zoom-percent").textContent = Math.round(scale * 100);
  queueRenderPage(pageNum);
}

// Zoom out
function zoomOut() {
  if (scale <= 0.5) return;
  scale -= 0.25;
  document.getElementById("zoom-percent").textContent = Math.round(scale * 100);
  queueRenderPage(pageNum);
}

// Fungsi pencarian
function searchJournals() {
  const searchTerm = document.getElementById("search-input").value.toLowerCase();
  const journalLinks = document.querySelectorAll(".journal-link");

  journalLinks.forEach((link) => {
    const title = link.textContent.toLowerCase();
    if (title.includes(searchTerm)) {
      link.parentElement.style.display = "block";
    } else {
      link.parentElement.style.display = "none";
    }
  });
}

// Event Listeners
document.getElementById("prev-page").addEventListener("click", onPrevPage);
document.getElementById("next-page").addEventListener("click", onNextPage);
document.getElementById("zoom-in").addEventListener("click", zoomIn);
document.getElementById("zoom-out").addEventListener("click", zoomOut);
document.getElementById("search-btn").addEventListener("click", searchJournals);
document.getElementById("search-input").addEventListener("keyup", function (e) {
  if (e.key === "Enter") searchJournals();
});

// Inisialisasi
window.onload = function () {
  initJournalList();
};
