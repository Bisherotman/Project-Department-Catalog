// 🔗 استيراد البيانات من ملف التصنيفات
import { categories } from './categories-data.js';
import { db } from './firebase-init.js';


// 🗃️ مصفوفة لتخزين كل المنتجات المعروضة
let allProducts = [];

// 📦 دالة لعرض المنتجات في الصفحة
function renderProducts(list) {
  const grid = document.getElementById('grid'); // أو productsGrid حسب ID عندك
  const count = document.getElementById('prodCount');

  if (!grid) return;
  grid.innerHTML = '';

  if (count) count.textContent = list.length;

  if (!list.length) {
    grid.innerHTML = `<p style="padding:1rem;color:#6b7280">لا توجد منتجات مطابقة.</p>`;
    return;
  }

  list.forEach(p => {
    const { model, brand, factoryCode, sapCode, imageUrl, photo, description } = p;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="card">
        <div class="thumb">
          <img src="${imageUrl || photo || 'assets/img/placeholder.png'}" alt="${model || ''}">
        </div>
        <div class="meta">
          <div class="title">${model || '-'}</div>
          <div class="sub">Brand: ${brand || '-'}</div>
          <div class="codes">Factory: ${factoryCode || '-'} | SAP: ${sapCode || '-'}</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// 🔍 تهيئة البحث المحلي
function normalize(str) {
  return (str || '').toString().toLowerCase().trim();
}

function filterProducts(query) {
  const n = normalize(query);
  if (!n) {
    renderProducts(allProducts);
    return;
  }

  const filtered = allProducts.filter(p => {
    const fields = [
      p.model,
      p.brand,
      p.factoryCode,
      p.sapCode
    ].map(normalize);
    return fields.some(f => f.includes(n));
  });

  renderProducts(filtered);
}

// 🕐 تأخير بسيط لمنع البحث الفوري
function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// 🚀 تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const title = urlParams.get("title"); // مثال: WC - Wall-Hung
  const [category, subcategory] = (title || "").split(" - ").map(s => s?.trim());

  console.log('cat from script:', category, subcategory);

  if (category && subcategory) {
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
      .then(({ collection, query, where, onSnapshot }) => {
        const q = query(
          collection(db, "products"),
          where("cat", "==", category),
          where("sub", "==", subcategory)
        );

        onSnapshot(q, (snapshot) => {
          allProducts = snapshot.docs.map(doc => doc.data());
          renderProducts(allProducts);
        });
      });
  }

  // ربط البحث
  const searchEl = document.getElementById('searchInput');
  if (searchEl) {
    searchEl.addEventListener('input', debounce(e => {
      filterProducts(e.target.value);
    }, 200));
  }
});
