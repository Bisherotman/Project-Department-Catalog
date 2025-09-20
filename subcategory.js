// 🔗 استيراد البيانات من ملف التصنيفات
import { categories } from './categories-data.js';
import { db } from './firebase-init.js';


// 🗃️ مصفوفة لتخزين كل المنتجات المعروضة
let allProducts = [];
let currentPage = 1;
const perPage = 24;

// 📦 دالة لعرض المنتجات في الصفحة
function renderProducts(list, page = 1) {
  const grid = document.getElementById('grid');
  const count = document.getElementById('prodCount');
  const pager = document.getElementById('pager');

  if (!grid) return;
  grid.innerHTML = '';

  if (count) count.textContent = list.length;

  const pageItems = paginate(list, page, perPage);

  if (!pageItems.length) {
    grid.innerHTML = `<p style="padding:1rem;color:#6b7280">لا توجد منتجات مطابقة.</p>`;
    pager.innerHTML = '';
    return;
  }

  pageItems.forEach(p => {
    const { model, brand, factoryCode, sapCode, imageUrl, photo } = p;
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

  // توليد أزرار الصفحات
  const totalPages = Math.ceil(list.length / perPage);
  pager.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === page ? 'active-page' : '';
    btn.addEventListener('click', () => {
      currentPage = i;
      renderProducts(list, currentPage);
    });
    pager.appendChild(btn);
  }
}


function paginate(list, page = 1, perPage = 24) {
  const start = (page - 1) * perPage;
  return list.slice(start, start + perPage);
}

// 🔍 تهيئة البحث المحلي
function normalize(str) {
  return (str || '').toString().toLowerCase().trim();
}

function applyFilters() {
  const brandVal = document.getElementById('brandFilter').value;
  const sapVal   = document.getElementById('sapFilter').value;
  const searchQ  = normalize(document.getElementById('searchInput').value);

  const filtered = allProducts.filter(p => {
    // فلتر براند
    if (brandVal && p.brand !== brandVal) return false;

    // فلتر SAP
    const hasSap = !!(p.sapCode && p.sapCode.trim());
    if (sapVal === 'with' && !hasSap) return false;
    if (sapVal === 'without' && hasSap) return false;

    // فلتر البحث
    if (searchQ) {
      const fields = [p.model, p.brand, p.factoryCode, p.sapCode]
        .map(normalize);
      if (!fields.some(f => f.includes(searchQ))) return false;
    }

    return true;
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

  // ربط الفلاتر مرة واحدة فقط
  document.getElementById('brandFilter')
    .addEventListener('change', applyFilters);
  document.getElementById('sapFilter')
    .addEventListener('change', applyFilters);
  document.getElementById('searchInput')
    .addEventListener('input', debounce(applyFilters, 200));

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

          // 🔹 ملء قائمة البراند تلقائياً
          const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
          const brandSelect = document.getElementById('brandFilter');
          brandSelect.innerHTML = `<option value="">كل العلامات التجارية</option>`;
          brands.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b;
            opt.textContent = b;
            brandSelect.appendChild(opt);
          });

          // 🔹 تطبيق الفلاتر
          applyFilters();
        });
      });
  }
});
