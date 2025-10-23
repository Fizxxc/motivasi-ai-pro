// public/app.js
import { db, ref, push, set, onValue, get, child } from "./firebase.js";

const promptEl = document.getElementById("prompt");
const toneEl = document.getElementById("tone");
const generateBtn = document.getElementById("generateBtn");
const resultCard = document.getElementById("resultCard");
const resultText = document.getElementById("resultText");
const copyBtn = document.getElementById("copyBtn");
const saveBtn = document.getElementById("saveBtn");
const historyList = document.getElementById("historyList");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = JSON.parse(localStorage.getItem("proUser")) || null;
let lastResult = "";

// Redirect ke login jika belum login
if (!currentUser && window.location.pathname !== "/login.html") {
  window.location.href = "/login.html";
}

/* ────────────────────────────────
   Load riwayat
──────────────────────────────── */
async function loadHistory() {
  if (!currentUser) return;
  const historyRef = ref(db, `proHistory/${currentUser.uid}`);
  onValue(historyRef, (snapshot) => {
    const val = snapshot.val() || {};
    const items = Object.entries(val).reverse();
    renderHistory(items);
  });
}

function renderHistory(items) {
  if (!historyList) return;
  if (!items.length) {
    historyList.innerHTML = `<p class="opacity-80 text-sm">Belum ada riwayat — buat motivasi pertama kamu!</p>`;
    return;
  }
  historyList.innerHTML = items.map(([id, data]) => {
    const short = data.text.length > 120 ? data.text.slice(0,120) + "…" : data.text;
    return `<div class="p-3 rounded-lg bg-white/6 flex justify-between items-start">
      <div>
        <div class="text-sm opacity-80">${data.prompt}</div>
        <div class="mt-1">${short}</div>
        <div class="text-xs opacity-70 mt-2">${new Date(data.createdAt).toLocaleString()}</div>
      </div>
      <div class="ml-4 flex flex-col gap-2">
        <button onclick="useHistory('${id}')" class="text-xs px-2 py-1 rounded bg-white/10">Gunakan</button>
      </div>
    </div>`;
  }).join("");
}

window.useHistory = async function(key) {
  if (!currentUser) return;
  const snapshot = await get(child(ref(db), `proHistory/${currentUser.uid}/${key}`));
  const data = snapshot.val();
  if (!data) return;
  resultText.textContent = data.text;
  lastResult = data.text;
  resultCard.classList.remove("hidden");
};

/* ────────────────────────────────
   Generate motivasi Pro
──────────────────────────────── */
if (generateBtn) {
  generateBtn.addEventListener("click", async () => {
    const prompt = promptEl.value.trim();
    const tone = toneEl.value;
    if (!prompt) { alert("Tolong isi prompt"); return; }

    generateBtn.disabled = true;
    generateBtn.textContent = "Sedang generate...";

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, tone, length: "pro" }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Error server");

      lastResult = data.result || "";
      resultText.textContent = lastResult;
      resultCard.classList.remove("hidden");

      // Simpan ke Firebase
      const historyRef = ref(db, `proHistory/${currentUser.uid}`);
      const newItem = push(historyRef);
      await set(newItem, { prompt, tone, text: lastResult, createdAt: Date.now() });

    } catch (err) {
      console.error(err);
      alert(err.message || "Coba lagi");
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = "Dapatkan Motivasi Pro";
    }
  });
}

/* ────────────────────────────────
   Salin & Simpan
──────────────────────────────── */
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    if (!lastResult) return;
    await navigator.clipboard.writeText(lastResult);
    copyBtn.textContent = "Disalin!";
    setTimeout(() => copyBtn.textContent = "Salin", 1500);
  });
}

if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    if (!lastResult || !currentUser) return;
    const savedRef = ref(db, `proSaved/${currentUser.uid}`);
    const newSave = push(savedRef);
    await set(newSave, { text: lastResult, savedAt: Date.now() });
    saveBtn.textContent = "Disimpan ✅";
    setTimeout(() => saveBtn.textContent = "Simpan", 1500);
  });
}

/* ────────────────────────────────
   Logout
──────────────────────────────── */
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("proUser");
    window.location.href = "/login.html";
  });
}

/* ────────────────────────────────
   Jalankan load history
──────────────────────────────── */
loadHistory();
