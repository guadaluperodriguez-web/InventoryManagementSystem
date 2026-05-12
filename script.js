// ===== INVENTORY MANAGEMENT SYSTEM =====

// --- Data ---
let products = JSON.parse(localStorage.getItem('inv_products') || '[]');
let editingId = null;

// Datos de ejemplo al iniciar
if (products.length === 0) {
  products = [
    { id: 1, name: 'Monitor 24"',      category: 'Electrónica', stock: 12, price: 249.99, minStock: 5 },
    { id: 2, name: 'Teclado Mecánico', category: 'Electrónica', stock:  3, price:  89.99, minStock: 5 },
    { id: 3, name: 'Resma A4',         category: 'Oficina',     stock:  0, price:   5.50, minStock: 10 },
    { id: 4, name: 'Camisa Oxford',    category: 'Ropa',        stock: 25, price:  34.00, minStock: 5 },
    { id: 5, name: 'Café Molido 500g', category: 'Alimentos',  stock:  8, price:   7.80, minStock: 10 },
  ];
  save();
}

// --- Helpers ---
function save() {
  localStorage.setItem('inv_products', JSON.stringify(products));
}

function genId() {
  return Date.now();
}

function getStatus(p) {
  if (p.stock === 0)         return { label: 'Sin Stock',  cls: 'badge-out' };
  if (p.stock <= p.minStock) return { label: 'Stock Bajo', cls: 'badge-low' };
  return                            { label: 'En Stock',   cls: 'badge-ok'  };
}

// --- Stats ---
function updateStats() {
  document.getElementById('statTotal').textContent = products.length;
  document.getElementById('statOk').textContent    = products.filter(p => p.stock > p.minStock).length;
  document.getElementById('statLow').textContent   = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  document.getElementById('statOut').textContent   = products.filter(p => p.stock === 0).length;
}

// --- Filter ---
function getFiltered() {
  const search   = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('filterCategory').value;
  return products.filter(p => {
    const matchName = p.name.toLowerCase().includes(search);
    const matchCat  = !category || p.category === category;
    return matchName && matchCat;
  });
}

// --- Desktop Table ---
function renderDesktopTable(filtered) {
  const tbody = document.getElementById('productTable');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No se encontraron productos.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map((p, i) => {
    const st = getStatus(p);
    return `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.category}</td>
        <td>${p.stock}</td>
        <td>$${Number(p.price).toFixed(2)}</td>
        <td><span class="badge ${st.cls}">${st.label}</span></td>
        <td>
          <button class="btn-edit" onclick="openEdit(${p.id})">Editar</button>
          <button class="btn-del"  onclick="deleteProduct(${p.id})">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

// --- Mobile Cards ---
function renderMobileCards(filtered) {
  const list = document.getElementById('productCardList');
  if (!list) return;

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-cards">No se encontraron productos.</div>';
    return;
  }

  list.innerHTML = filtered.map(p => {
    const st = getStatus(p);
    return `
      <div class="prod-card">
        <div class="prod-card-top">
          <span class="prod-card-name">${p.name}</span>
          <span class="badge ${st.cls}">${st.label}</span>
        </div>
        <div class="prod-card-meta">
          <span>${p.category}</span>
          <span><strong>$${Number(p.price).toFixed(2)}</strong></span>
          <span>Stock: <strong>${p.stock}</strong> &nbsp;·&nbsp; Mín: ${p.minStock}</span>
        </div>
        <div class="prod-card-actions">
          <button class="btn-edit" onclick="openEdit(${p.id})">Editar</button>
          <button class="btn-del"  onclick="deleteProduct(${p.id})">Eliminar</button>
        </div>
      </div>
    `;
  }).join('');
}

// --- Render all ---
function renderTable() {
  const filtered = getFiltered();
  renderDesktopTable(filtered);
  renderMobileCards(filtered);
}

function render() {
  updateStats();
  renderTable();
}

// --- CRUD ---
function deleteProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`¿Eliminar "${p.name}"?`)) return;
  products = products.filter(x => x.id !== id);
  save();
  render();
}

function openEdit(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Editar Producto';
  document.getElementById('fName').value     = p.name;
  document.getElementById('fCategory').value = p.category;
  document.getElementById('fStock').value    = p.stock;
  document.getElementById('fPrice').value    = p.price;
  document.getElementById('fMinStock').value = p.minStock;
  openModal();
}

// --- Modal ---
function openModal() {
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.getElementById('productForm').reset();
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Agregar Producto';
}

document.getElementById('openModal').addEventListener('click', openModal);
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// --- Form submit ---
document.getElementById('productForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name     = document.getElementById('fName').value.trim();
  const category = document.getElementById('fCategory').value;
  const stock    = parseInt(document.getElementById('fStock').value);
  const price    = parseFloat(document.getElementById('fPrice').value);
  const minStock = parseInt(document.getElementById('fMinStock').value) || 5;

  if (editingId) {
    const p = products.find(x => x.id === editingId);
    if (p) Object.assign(p, { name, category, stock, price, minStock });
  } else {
    products.push({ id: genId(), name, category, stock, price, minStock });
  }

  save();
  closeModal();
  render();
});

// --- Search & Filter ---
document.getElementById('searchInput').addEventListener('input', renderTable);
document.getElementById('filterCategory').addEventListener('change', renderTable);

// --- Date ---
function updateDate() {
  document.getElementById('liveDate').textContent =
    new Date().toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
}
setInterval(updateDate, 1000);

// --- Init ---
updateDate();
render();