// subcategory.js (Firestore-powered)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TODO: ضع إعدادات مشروعك هنا
const firebaseConfig = {
    apiKey: "AIzaSyDmUg1cQ4HTa0wEThuZAncYOwyZRFtnlsU",
    authDomain: "projects-catalog.firebaseapp.com",
    projectId: "projects-catalog",
    storageBucket: "projects-catalog.firebasestorage.app",
    messagingSenderId: "813379257336",
    appId: "1:813379257336:web:b2372449cbe46e15c20c0d"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helpers
const $ = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));

const pageTitle = $("#pageTitle");
const crumbTitle = $("#crumbTitle");
const grid = $("#grid");
const pager = $("#pager");
const searchBox = $("#searchBox");
const clearBtn = $("#clearBtn");
const searchFab = $("#searchFab");

// Drawer
const openBtn = $("#openDrawer");
const drawer = $("#drawer");
const backdrop = $("#backdrop");
function openDrawer(){ document.body.classList.add("is-side-open"); backdrop.hidden=false; openBtn?.setAttribute("aria-expanded","true"); drawer?.setAttribute("aria-hidden","false"); }
function closeDrawer(){ document.body.classList.remove("is-side-open"); backdrop.hidden=true; openBtn?.setAttribute("aria-expanded","false"); drawer?.setAttribute("aria-hidden","true"); }
openBtn?.addEventListener("click", ()=>{ document.body.classList.contains("is-side-open") ? closeDrawer() : openDrawer(); });
backdrop?.addEventListener("click", closeDrawer);
document.addEventListener("keydown", e=>{ if(e.key==="Escape" && document.body.classList.contains("is-side-open")) closeDrawer(); });

// Read subcategory from URL (e.g., "WC - Wall-Hung")
const params = new URLSearchParams(location.search);
const PATH = params.get("title") || "Subcategory";
pageTitle && (pageTitle.textContent = PATH);
crumbTitle && (crumbTitle.textContent = PATH);

// Pagination
const PAGE_SIZE = 16;
let products = [];
let filtered = [];
let page = 1;

function renderGrid(){
  grid.innerHTML = "";
  const start = (page-1)*PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);
  slice.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <a class="pic" href="#" tabindex="-1">
        <img src="${p.imageUrl || "assets/img/placeholder.png"}" alt="${(p.name||p.model||"Product").replace(/"/g, "&quot;")}">
      </a>
      <h3><a href="#">${[p.brand, p.model].filter(Boolean).join(" ") || (p.name||"Product")}</a></h3>
      <p>${p.factoryCode ? `Factory: ${p.factoryCode}` : ""} ${p.sapCode ? ` | SAP: ${p.sapCode}` : ""}</p>
      <div class="meta">${p.brand || ""} ${p.model || ""}</div>
    `;
    grid.appendChild(card);
  });
  $("#prodCount") && ($("#prodCount").textContent = String(filtered.length));

  // pager
  pager.innerHTML = "";
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  for(let i=1;i<=pages;i++){
    const b = document.createElement("button");
    b.textContent = String(i);
    if(i===page) b.className = "is-active";
    b.addEventListener("click", ()=>{ page=i; renderGrid(); window.scrollTo({top:0, behavior:"smooth"}); });
    pager.appendChild(b);
  }
}

function applySearch(){
  const term = (searchBox?.value||"").trim().toLowerCase();
  filtered = term
    ? products.filter(p => [p.name, p.brand, p.model, p.sapCode, p.factoryCode]
          .some(x => String(x||"").toLowerCase().includes(term)))
    : [...products];
  page = 1;
  renderGrid();
}

searchBox?.addEventListener("input", applySearch);
clearBtn?.addEventListener("click", ()=>{ if(searchBox){ searchBox.value=""; applySearch(); }});
searchFab?.addEventListener("click", ()=> searchBox?.focus());

async function loadProducts(){
  // We match the field 'path' that stores the exact label like "WC - Wall-Hung"
  const qRef = query(collection(db, "products"),
                     where("path", "==", PATH),
                     orderBy("createdAt", "desc"));
  const snap = await getDocs(qRef);
  products = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  filtered = [...products];
  renderGrid();
}

loadProducts().catch(console.error);
