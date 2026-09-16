// 定数設定
const TAX_RATE = 0.10; // 消費税10%
const MAX_QUANTITY = 99; // 1商品あたりの最大購入数

// カートの状態保持用オブジェクト { productId: quantity }
let cart = {};

/**
 * products.json から商品データを取得
 */
async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        
        if (!response.ok) {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        }
        
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('商品データの取得に失敗しました:', error);
    }
}

/**
 * 商品一覧をHTMLに出力
 * @param {Array} products - 商品オブジェクトの配列
 */
function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = '';

    products.forEach(product => {
        // 税込価格の計算 (端数切り捨て)
        const priceWithTax = Math.floor(product.price * (1 + TAX_RATE));

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img class="product-image" src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-title">${product.name}</div>
                <div class="product-price-box">
                    <span class="product-price">¥${priceWithTax.toLocaleString()}</span>
                    <span class="product-tax">(税抜 ¥${product.price.toLocaleString()})</span>
                </div>
                <button class="btn-add-cart" onclick="addToCart(${product.id})">カートに入れる</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * カート追加処理（最大99件制限）
 * @param {number} productId - 追加する商品のID
 */
function addToCart(productId) {
    const currentQty = cart[productId] || 0;

    if (currentQty >= MAX_QUANTITY) {
        alert(`同一商品は最大${MAX_QUANTITY}件までしか購入できません。`);
        return;
    }

    cart[productId] = currentQty + 1;
    updateCartCount();
    alert('カートに追加しました！');
}

/**
 * カート件数表示の更新
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) return;

    const totalCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    cartCountElement.textContent = `Cart (${totalCount})`;
}

// ページ読み込み完了時に商品一覧を取得
document.addEventListener('DOMContentLoaded', fetchProducts);