// 🔗 استيراد البيانات من ملف التصنيفات
import { categories } from './categories-data.js';

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
    const { model, brand, factoryCode, sapCode, image, description } = p;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="card">
        <div class="thumb">
          <img src="${image || 'assets/img/placeholder.png'}" alt="${model || ''}">
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
  // 🧠 معرفة التصنيف الفرعي من عنوان الرابط
  const urlParams = new URLSearchParams(window.location.search);
  const title = urlParams.get("title"); // ex: "WC - Wall-Hung"
  const [category, subcategory] = (title || "").split(" - ").map(s => s?.trim());

  if (category && subcategory && categories[category] && categories[category][subcategory]) {
    allProducts = categories[category][subcategory];
    renderProducts(allProducts);
  }

  // ربط البحث
  const searchEl = document.getElementById('searchInput');
  if (searchEl) {
    searchEl.addEventListener('input', debounce(e => {
      filterProducts(e.target.value);
    }, 200));
  }
});
