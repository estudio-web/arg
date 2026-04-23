/* PagoSimple shared browser module. Firebase v8 CDN compatible. */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA9R_HphpqF8YGwrD43grjuq0dKYohfJhM",
  authDomain: "payment-42a51.firebaseapp.com",
  projectId: "payment-42a51"
};

const IMGBB_KEY = "9ed686117bdb0d5263132a2e5ec5b094";

const PLAN_IDS = ["trial", "plan1", "plan2"];
const PLANS = {
  trial: {
    id: "trial",
    name: "TRIAL",
    price: 0,
    maxLinks: 1,
    durationDays: 14,
    description: "14 dias, 1 link maximo"
  },
  plan1: {
    id: "plan1",
    name: "PLAN 1",
    price: 15000,
    maxLinks: 10,
    durationDays: null,
    description: "Hasta 10 links activos"
  },
  plan2: {
    id: "plan2",
    name: "PLAN 2",
    price: 25000,
    maxLinks: 50,
    durationDays: null,
    description: "Hasta 50 links activos"
  }
};

function initFirebase(appName) {
  if (appName) {
    const existing = firebase.apps.find(app => app.name === appName);
    const app = existing || firebase.initializeApp(FIREBASE_CONFIG, appName);
    return {
      app,
      auth: typeof app.auth === "function" ? app.auth() : null,
      db: typeof firebase.firestore === "function" ? firebase.firestore() : null
    };
  }

  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  return {
    app: firebase.app(),
    auth: typeof firebase.auth === "function" ? firebase.auth() : null,
    db: typeof firebase.firestore === "function" ? firebase.firestore() : null
  };
}

function serverTimestamp() {
  if (!firebase.firestore) throw new Error("Firestore SDK no esta cargado en esta pagina");
  return firebase.firestore.FieldValue.serverTimestamp();
}

async function requireAuth(redirectTo = "login.html") {
  const { auth } = initFirebase();
  return new Promise(resolve => {
    const unsub = auth.onAuthStateChanged(user => {
      unsub();
      if (!user) {
        window.location.href = redirectTo;
        return;
      }
      resolve(user);
    });
  });
}

async function requireSuperAdmin(db, user) {
  if (!user) return false;
  const snap = await db.collection("users").doc(user.uid).get();
  return snap.exists && snap.data().role === "superadmin" && snap.data().active !== false;
}

function getPlanMeta(planId) {
  return PLANS[planId] || PLANS.trial;
}

function normalizePlan(profile) {
  if (!profile) return "trial";
  if (PLAN_IDS.includes(profile.plan)) return profile.plan;
  if (profile.plan === "pro") return "plan2";
  return "trial";
}

function trialEndDate(createdAt) {
  const date = createdAt && createdAt.toDate ? createdAt.toDate() : new Date(createdAt || Date.now());
  date.setDate(date.getDate() + PLANS.trial.durationDays);
  return date;
}

function isPlanExpired(profile) {
  if (!profile) return true;
  const plan = normalizePlan(profile);
  if (profile.active === false) return true;
  if (profile.planExpiresAt) {
    const exp = profile.planExpiresAt.toDate ? profile.planExpiresAt.toDate() : new Date(profile.planExpiresAt);
    return exp.getTime() < Date.now();
  }
  if (plan === "trial") return trialEndDate(profile.createdAt).getTime() < Date.now();
  return false;
}

function formatMoney(n) {
  return "$" + Number(n || 0).toLocaleString("es-AR");
}

function formatDate(ts) {
  if (!ts) return "-";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function shortDate(ts) {
  if (!ts) return "-";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

function cleanWhatsApp(value) {
  return String(value || "").replace(/\D/g, "");
}

function genId(len = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function buildPaymentURL(uid, paymentId) {
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "");
  return `${base}/payments.html?u=${encodeURIComponent(uid)}&p=${encodeURIComponent(paymentId)}`;
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

let _toastTimer;
function showToast(msg, type = "success") {
  let toast = document.getElementById("global-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "global-toast";
    toast.className = "toast";
    toast.innerHTML = '<div class="toast-icon success"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div><span id="toast-text"></span>';
    document.body.appendChild(toast);
  }
  const icon = toast.querySelector(".toast-icon");
  icon.className = `toast-icon ${type}`;
  document.getElementById("toast-text").textContent = msg;
  toast.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = "Copiado";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove("copied");
      }, 1800);
    }
    showToast("Copiado al portapapeles", "success");
  });
}

async function uploadImage(file) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: fd });
  const data = await res.json();
  if (!data.success) throw new Error("No se pudo subir la imagen");
  return data.data.url;
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

async function checkLinkLimit(db, uid, profileOrPlan) {
  const profile = typeof profileOrPlan === "string" ? { plan: profileOrPlan } : profileOrPlan;
  const plan = getPlanMeta(normalizePlan(profile));
  if (isPlanExpired(profile)) return { ok: false, count: 0, max: plan.maxLinks, reason: "expired" };
  const paymentsRef = db.collection("users").doc(uid).collection("payments");
  const snap = plan.id === "trial"
    ? await paymentsRef.get()
    : await paymentsRef.where("active", "==", true).get();
  const count = snap.size;
  return { ok: count < plan.maxLinks, count, max: plan.maxLinks, reason: count >= plan.maxLinks ? "limit" : "" };
}

function getQRUrl(text, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=${size}x${size}&bgcolor=ffffff&color=111827&margin=10`;
}
