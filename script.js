// ===== Tab Switching (already in your file) =====
function showFaction(factionId) {
  // Hide all sections
  const sections = document.querySelectorAll(".tab-content");
  sections.forEach((section) => section.classList.remove("active"));

  // Show selected faction
  document.getElementById(factionId).classList.add("active");
}

// ===== Review Loader (random 5, fixed columns) =====
(async function () {
  const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgAUZ-jZq72eQTzi2hKoy6a3HVvhw7GtNxHF9Esb2HxF0GH5xgime_JrFZGRz7aDvbTzVTRsYSL3Ye/pub?gid=1478285338&single=true&output=csv";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const csv = await res.text();

    const rows = parseCSV(csv);
    const headers = rows.shift() || [];
    console.log("CSV headers:", headers);

    // Find column indexes
    const nameIdx   = headers.findIndex((h) => /name/i.test(h));
    const ratingIdx = headers.findIndex((h) => /rating/i.test(h));
    const reviewIdx = headers.findIndex((h) => /review/i.test(h));

    const container = document.getElementById("reviews");

    if (nameIdx === -1 || reviewIdx === -1) {
      container.textContent = "Could not detect columns in the sheet.";
      return;
    }

    // Shuffle + pick 5
   // Filter: only 4★ and 5★ reviews
const filtered = rows.filter((cols) => {
  const rating = parseInt((cols[ratingIdx] ?? "0").trim(), 10);
  return rating >= 4; // keep only 4 and 5 star reviews
});

// Shuffle + pick 5
const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 5);


    shuffled.forEach((cols) => {
      const name   = (cols[nameIdx]   ?? "Anonymous").trim();
      const review = (cols[reviewIdx] ?? "").trim();
      const rating = parseInt((cols[ratingIdx] ?? "0").trim(), 10);

      if (!review) return;

      const card = document.createElement("div");
      card.className = "review";

      const h4 = document.createElement("h4");
      h4.textContent = name;

      // Stars
      const stars = document.createElement("div");
      stars.className = "stars";
      const filled = isNaN(rating) ? 0 : Math.max(0, Math.min(5, rating));
      stars.innerHTML = "★".repeat(filled) + "☆".repeat(5 - filled);

      const p = document.createElement("p");
      p.textContent = review;

      card.append(h4, stars, p);
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading reviews:", err);
    document.getElementById("reviews").textContent =
      "Could not load reviews right now.";
  }

  function parseCSV(str) {
    const rows = [];
    let row = [],
      cell = "",
      i = 0,
      inQuotes = false;
    while (i < str.length) {
      const c = str[i];
      if (inQuotes) {
        if (c === '"') {
          if (str[i + 1] === '"') {
            cell += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cell += c;
        }
      } else {
        if (c === '"') inQuotes = true;
        else if (c === ",") {
          row.push(cell);
          cell = "";
        } else if (c === "\n") {
          row.push(cell);
          rows.push(row);
          row = [];
          cell = "";
        } else if (c !== "\r") {
          cell += c;
        }
      }
      i++;
    }
    if (cell !== "" || row.length) {
      row.push(cell);
      rows.push(row);
    }
    return rows;
  }
})();
