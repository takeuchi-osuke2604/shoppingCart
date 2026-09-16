let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || {};
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentCategory = 'all';
let showOnlyFav = false;

document.addEventListener('DOMContentLoaded', async () => {
  await fetchProducts();
  setupCategorySelect();
  setupTabButtons();
  renderProducts();
  renderCart();
});

// JSONの取得
async function fetchProducts() {
  try {
    const response = await fetch('products.json');
    products = await response.json();
  } catch (e) {
    console.error('データの取得に失敗しました', e);
  }
}

// カテゴリ選択オプション作成
function setupCategorySelect() {
  const select = document.getElementById('category-select');
  const categories = [...new Set(products.map(p => p.category))];
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  select.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderProducts();
  });
}

// タブ切替（商品一覧 / お気に入り）[cite: 1]
function setupTabButtons() {
  const tabAll = document.getElementById('tab-all');
  const tabFav = document.getElementById('tab-fav');

  tabAll.addEventListener('click', () => {
    showOnlyFav = false;
    tabAll.classList.add('active');
    tabFav.classList.remove('active');
    renderProducts();
  });

  tabFav.addEventListener('click', () => {
    showOnlyFav = true;
    tabFav.classList.add('active');
    tabAll.classList.remove('active');
    renderProducts();
  });
}

// 商品一覧の描画[cite: 1]
function renderProducts() {
  const container = document.getElementById('product-list');
  container.innerHTML = '';

  let filtered = products;

  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  if (showOnlyFav) {
    filtered = filtered.filter(p => favorites.includes(p.id));
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p class="empty-msg">該当する商品がありません。</p>';
    return;
  }

  filtered.forEach(p => {
    const isFav = favorites.includes(p.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div>
        <div class="product-image" style="background-color: ${p.color};"></div>
        <div class="product-info">
          <h3>${p.name}</h3>
          <p class="price">${p.price.toLocaleString()}円 (税抜)</p>
        </div>
      </div>
      <div class="card-buttons">
        <button class="btn-add" onclick="addToCart(${p.id})">カートへ</button>
        <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFav(${p.id})">
          ${isFav ? '★' : '☆'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// カート関連の処理[cite: 1]
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  if (cart[id] > 99) cart[id] = 99;
  saveCart();
  renderCart();
}

function updateQuantity(id, delta) {
  if (!cart[id]) return;
  
  cart[id] += delta;
  
  if (cart[id] <= 0) {
    delete cart[id];
  } else if (cart[id] > 99) {
    cart[id] = 99;
  }
  
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// カート一覧描画 & 計算[cite: 1]
function renderCart() {
  const cartList = document.getElementById('cart-list');
  cartList.innerHTML = '';

  const itemIds = Object.keys(cart);

  if (itemIds.length === 0) {
    cartList.innerHTML = '<p class="empty-msg">カートは空です</p>';
    document.getElementById('total-excl').textContent = '0';
    document.getElementById('total-incl').textContent = '0';
    return;
  }

  let totalExcl = 0;

  itemIds.forEach(id => {
    const product = products.find(p => p.id === Number(id));
    if (!product) return;

    const qty = cart[id];
    totalExcl += product.price * qty;

    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <div>
        <div><strong>${product.name}</strong></div>
        <small>${product.price.toLocaleString()}円 × ${qty}</small>
      </div>
      <div class="cart-controls">
        <button onclick="updateQuantity(${product.id}, -1)">-</button>
        <span>${qty}</span>
        <button onclick="updateQuantity(${product.id}, 1)">+</button>
      </div>
    `;
    cartList.appendChild(item);
  });

  // 端数切り捨て計算[cite: 1]
  const totalIncl = Math.floor(totalExcl * 1.1);

  document.getElementById('total-excl').textContent = totalExcl.toLocaleString();
  document.getElementById('total-incl').textContent = totalIncl.toLocaleString();
}

// お気に入り関連の処理[cite: 1]
function toggleFav(id) {
  const index = favorites.indexOf(id);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(id);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderProducts();
}