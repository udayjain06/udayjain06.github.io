/* =====================================================
   AMAZON CLONE — script.js
   Works with your existing HTML & CSS — no changes needed
   ===================================================== */

'use strict';

/* ─── 1. CART STATE ─────────────────────────────────── */
const cart = {};   // { productId: { title, price, img, qty } }

/* ─── 2. PRODUCT DATA  ──────────────────────────────── */
/* Mapped from your existing .intelligence cards in HTML */
const PRODUCTS = [
  { id: 'p1', title: 'Desk Mat for Office & Home',   price: 429,   img: 'computer.jpg' },
  { id: 'p2', title: 'Samsung Galaxy A55 5G',         price: 28999, img: 'Samsung Galaxy A55 5G.jpg' },
  { id: 'p3', title: 'GoSriKi Kurta Set',             price: 696,   img: 'clothes.jpg' },
  { id: 'p4', title: 'Cetaphil Face Wash 125ml',      price: 337,   img: 'Cetaphil.jpg' },
  { id: 'p5', title: 'Dyazo Laptop Bag 15.6"',        price: 299,   img: 'laptopbag.jpg' },
  { id: 'p6', title: 'MacBook Air',                   price: 99900, img: 'MacBook Air.jpg' },
  { id: 'p7', title: 'Lymio Lightweight Jacket',      price: 749,   img: 'jacket.jpg' },
  { id: 'p8', title: 'Pivl Women Cardigan Sweater',   price: 379,   img: 'Pivl.jpg' },
  { id: 'p9', title: 'Alan Jones Zip Hoodie',         price: 799,   img: 'Alan Jones.jpg' },
];

/* ─── 3. INJECT "ADD TO CART" BUTTONS ──────────────── */
function injectCartButtons() {
  const cards = document.querySelectorAll('.intelligence');
  cards.forEach((card, i) => {
    const product = PRODUCTS[i];
    if (!product || card.querySelector('.js-add-btn')) return;

    const priceEl = card.querySelector('p');
    if (priceEl) priceEl.style.cssText = 'color:#b12704;font-weight:700;font-size:16px;margin:6px 0';

    const btn = document.createElement('button');
    btn.className = 'js-add-btn';
    btn.dataset.id = product.id;
    btn.textContent = 'Add to Cart';
    btn.style.cssText = [
      'width:100%','margin-top:10px','padding:9px 0',
      'background:#ff9900','border:1px solid #c8943a',
      'border-radius:20px','font-weight:700','font-size:13px',
      'cursor:pointer','transition:background .2s,transform .15s',
      'font-family:inherit'
    ].join(';');
    btn.addEventListener('mouseenter', () => { if(!btn.classList.contains('added')) btn.style.background='#e68900'; });
    btn.addEventListener('mouseleave', () => { if(!btn.classList.contains('added')) btn.style.background='#ff9900'; });
    btn.addEventListener('click', (e) => { e.stopPropagation(); addToCart(product.id); });
    card.appendChild(btn);
  });
}

/* ─── 4. CART DRAWER ────────────────────────────────── */
function buildCartDrawer() {
  if (document.getElementById('js-cart-drawer')) return;

  const overlay = document.createElement('div');
  overlay.id = 'js-cart-overlay';
  overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:998';
  overlay.addEventListener('click', closeCart);

  const drawer = document.createElement('aside');
  drawer.id = 'js-cart-drawer';
  drawer.innerHTML = `
    <div style="background:#131921;color:#fff;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
      <h2 style="font-size:17px;margin:0">🛒 Shopping Cart</h2>
      <button id="js-cart-close" aria-label="Close" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1">✕</button>
    </div>
    <div id="js-cart-items" style="flex:1;overflow-y:auto;padding:14px;"></div>
    <div id="js-cart-footer" style="display:none;border-top:2px solid #ddd;padding:16px 20px;flex-shrink:0">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:14px;margin-bottom:14px">
        <span>Subtotal (<span id="js-cart-count">0</span> items):</span>
        <strong style="font-size:18px">&#8377;<span id="js-cart-total">0</span></strong>
      </div>
      <button id="js-checkout-btn" style="width:100%;background:#febd69;border:1px solid #c8943a;border-radius:20px;padding:11px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">Proceed to Checkout</button>
      <p style="text-align:center;font-size:11px;color:#007600;margin-top:8px">FREE delivery on orders over &#8377;499</p>
    </div>`;
  drawer.style.cssText = [
    'position:fixed','right:0','top:0','height:100%','width:min(420px,100%)',
    'background:#fff','z-index:999','display:flex','flex-direction:column',
    'transform:translateX(100%)','transition:transform .3s cubic-bezier(.4,0,.2,1)',
    'box-shadow:-6px 0 30px rgba(0,0,0,.2)'
  ].join(';');

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
  document.getElementById('js-cart-close').addEventListener('click', closeCart);
  document.getElementById('js-checkout-btn').addEventListener('click', checkout);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
}

function openCart()  {
  renderCartItems();
  document.getElementById('js-cart-drawer').style.transform = 'translateX(0)';
  document.getElementById('js-cart-overlay').style.display  = 'block';
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('js-cart-drawer').style.transform = 'translateX(100%)';
  document.getElementById('js-cart-overlay').style.display  = 'none';
  document.body.style.overflow = '';
}

/* ─── 5. ADD / CHANGE QTY ───────────────────────────── */
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  if (!cart[id]) cart[id] = { ...product, qty: 0 };
  cart[id].qty++;

  updateCartBadge();
  renderCartItems();

  const btn = document.querySelector(`.js-add-btn[data-id="${id}"]`);
  if (btn) {
    btn.textContent = '✓ Added';
    btn.style.cssText += ';background:#2e7d32;border-color:#1b5e20;color:#fff';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = 'Add to Cart';
      btn.style.background = '#ff9900';
      btn.style.borderColor = '#c8943a';
      btn.style.color = '#111';
      btn.classList.remove('added');
    }, 2000);
  }
  showToast('🛒 ' + product.title.slice(0,32) + (product.title.length > 32 ? '…' : '') + ' added!');
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartBadge();
  renderCartItems();
}

/* ─── 6. RENDER CART ────────────────────────────────── */
function renderCartItems() {
  const itemsEl   = document.getElementById('js-cart-items');
  const footerEl  = document.getElementById('js-cart-footer');
  const countEl   = document.getElementById('js-cart-count');
  const totalEl   = document.getElementById('js-cart-total');
  if (!itemsEl) return;

  const items    = Object.values(cart).filter(i => i.qty > 0);
  const totalQty = items.reduce((s,i) => s + i.qty, 0);
  const totalRs  = items.reduce((s,i) => s + i.price * i.qty, 0);

  countEl.textContent  = totalQty;
  totalEl.textContent  = totalRs.toLocaleString('en-IN');
  footerEl.style.display = items.length ? 'block' : 'none';

  if (!items.length) {
    itemsEl.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#888">
      <div style="font-size:52px">🛒</div>
      <p style="font-size:15px;font-weight:600;margin:12px 0 4px">Your cart is empty</p>
      <span style="font-size:13px">Add items to get started!</span></div>`;
    return;
  }

  itemsEl.innerHTML = items.map(item => `
    <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #eee">
      <img src="${item.img}" alt="${item.title}"
        style="width:64px;height:64px;object-fit:contain;border:1px solid #ddd;border-radius:6px;flex-shrink:0"
        onerror="this.src='https://via.placeholder.com/64?text=P'" />
      <div style="flex:1;min-width:0">
        <p style="font-size:12px;font-weight:600;line-height:1.35;margin:0 0 4px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${item.title}</p>
        <p style="font-size:14px;color:#b12704;font-weight:700;margin:0 0 6px">&#8377;${item.price.toLocaleString('en-IN')}</p>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <button onclick="changeQty('${item.id}',-1)"
            style="width:26px;height:26px;border:1px solid #ddd;border-radius:4px;background:#f3f3f3;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;font-family:inherit">−</button>
          <span style="font-size:14px;font-weight:700;min-width:20px;text-align:center">${item.qty}</span>
          <button onclick="changeQty('${item.id}',1)"
            style="width:26px;height:26px;border:1px solid #ddd;border-radius:4px;background:#f3f3f3;font-size:18px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;font-family:inherit">+</button>
          <button onclick="changeQty('${item.id}',-999)"
            style="margin-left:auto;background:none;border:none;color:#007185;font-size:11px;cursor:pointer;text-decoration:underline;font-family:inherit">Remove</button>
        </div>
      </div>
    </div>`).join('');
}

/* ─── 7. CART BADGE (updates your existing .bubble) ─── */
function updateCartBadge() {
  const total = Object.values(cart).reduce((s,i) => s + i.qty, 0);
  let bubble = document.querySelector('.cart .bubble');
  if (!bubble) {
    bubble = document.createElement('div');
    bubble.className = 'bubble';
    const cartEl = document.querySelector('.cart');
    if (cartEl) cartEl.prepend(bubble);
  }
  bubble.textContent = total;
  bubble.style.display = total > 0 ? 'flex' : 'none';
  bubble.style.transform = 'scale(1.5)';
  setTimeout(() => bubble.style.transform = 'scale(1)', 250);
}

/* ─── 8. WIRE EXISTING CART ICON ────────────────────── */
function wireCartIcon() {
  const cartEl = document.querySelector('.cart');
  if (cartEl) { cartEl.style.cursor = 'pointer'; cartEl.addEventListener('click', openCart); }
}

/* ─── 9. SEARCH ─────────────────────────────────────── */
function wireSearch() {
  const input  = document.querySelector('.search input');
  const button = document.querySelector('.search button');
  if (!input) return;

  const banner = document.createElement('div');
  banner.id = 'js-search-banner';
  banner.style.cssText = 'display:none;background:#fff;border-bottom:1px solid #ddd;padding:10px 20px;font-size:14px;align-items:center;gap:10px';
  banner.innerHTML = `Showing <strong id="js-rc" style="color:#b12704">0</strong> results for "<span id="js-rq"></span>" &nbsp;<button id="js-cls" style="background:none;border:none;color:#007185;font-size:13px;cursor:pointer;text-decoration:underline;font-family:inherit">Clear ✕</button>`;
  const subnav = document.querySelector('nav.subnav');
  if (subnav) subnav.after(banner);
  document.getElementById('js-cls').addEventListener('click', () => { input.value=''; doSearch(''); });

  input.addEventListener('input',   () => doSearch(input.value.trim()));
  input.addEventListener('keydown', e => { if (e.key==='Enter') doSearch(input.value.trim()); });
  if (button) button.addEventListener('click', () => doSearch(input.value.trim()));
}

function doSearch(query) {
  const cards   = document.querySelectorAll('.intelligence');
  const banner  = document.getElementById('js-search-banner');
  let matches   = 0;
  cards.forEach((card, i) => {
    const p    = PRODUCTS[i];
    const text = (card.innerText + (p ? p.title : '')).toLowerCase();
    const show = !query || text.includes(query.toLowerCase());
    card.style.display = show ? '' : 'none';
    if (show) matches++;
  });
  if (banner) {
    banner.style.display = query ? 'flex' : 'none';
    if (query) {
      document.getElementById('js-rc').textContent = matches;
      document.getElementById('js-rq').textContent = query;
    }
  }
}

/* ─── 10. SUBNAV HOVER BORDERS ──────────────────────── */
function wireSubnav() {
  document.querySelectorAll('nav.subnav a').forEach(link => {
    link.style.cssText += ';border:2px solid transparent;border-radius:4px;padding:4px 8px;transition:border-color .15s';
    link.addEventListener('mouseenter', () => link.style.borderColor='#fff');
    link.addEventListener('mouseleave', () => { if(!link.classList.contains('snav-active')) link.style.borderColor='transparent'; });
    link.addEventListener('click', () => {
      document.querySelectorAll('nav.subnav a').forEach(l => { l.classList.remove('snav-active'); l.style.borderColor='transparent'; });
      link.classList.add('snav-active');
      link.style.borderColor = '#fff';
    });
  });
}

/* ─── 11. SCROLL ARROWS for .productline1 ───────────── */
function wireProductScroll() {
  const line = document.querySelector('.productline1');
  if (!line) return;
  const wrap = line.parentElement;
  if (!wrap) return;
  wrap.style.position = 'relative';

  const makeArrow = (dir) => {
    const btn = document.createElement('button');
    btn.textContent = dir === 'left' ? '‹' : '›';
    btn.style.cssText = [
      `position:absolute;${dir}:0;top:50%;transform:translateY(-50%)`,
      'z-index:10;background:rgba(255,255,255,.95);border:1px solid #ddd',
      'border-radius:50%;width:38px;height:38px;font-size:24px',
      'cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.15)',
      'display:flex;align-items:center;justify-content:center;line-height:1',
      'font-family:inherit;transition:background .15s'
    ].join(';');
    btn.addEventListener('mouseenter', () => btn.style.background='#f0f0f0');
    btn.addEventListener('mouseleave', () => btn.style.background='rgba(255,255,255,.95)');
    btn.addEventListener('click', () => line.scrollBy({ left: dir==='left' ? -340 : 340, behavior:'smooth' }));
    return btn;
  };
  wrap.appendChild(makeArrow('left'));
  wrap.appendChild(makeArrow('right'));
}

/* ─── 12. BACK TO TOP ───────────────────────────────── */
function wireBackToTop() {
  const panel = document.querySelector('.footpanel1');
  if (panel) { panel.style.cursor='pointer'; panel.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' })); }
}

/* ─── 13. STICKY HEADER SHADOW ──────────────────────── */
function wireScrollShadow() {
  const header = document.querySelector('header.topnav');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 8 ? '0 2px 14px rgba(0,0,0,.4)' : 'none';
  }, { passive: true });
}

/* ─── 14. CHECKOUT ──────────────────────────────────── */
function checkout() {
  const total = document.getElementById('js-cart-total').textContent;
  Object.keys(cart).forEach(k => delete cart[k]);
  updateCartBadge();
  renderCartItems();
  closeCart();
  showToast('✅ Order placed! Total: ₹' + total + ' — Thank you!');
}

/* ─── 15. TOAST ─────────────────────────────────────── */
let toastTimer;
function buildToast() {
  if (document.getElementById('js-toast')) return;
  const t = document.createElement('div');
  t.id = 'js-toast';
  t.style.cssText = [
    'position:fixed','bottom:28px','left:50%',
    'transform:translateX(-50%) translateY(80px)',
    'background:#1a1a1a','color:#fff',
    'padding:12px 22px','border-radius:24px',
    'font-size:13px','z-index:1000','opacity:0',
    'transition:transform .35s cubic-bezier(.175,.885,.32,1.275),opacity .35s',
    'pointer-events:none','max-width:320px','text-align:center',
    'box-shadow:0 4px 20px rgba(0,0,0,.3)','font-family:inherit'
  ].join(';');
  document.body.appendChild(t);
}
function showToast(msg) {
  const t = document.getElementById('js-toast');
  if (!t) return;
  t.textContent = msg;
  t.style.transform = 'translateX(-50%) translateY(0)';
  t.style.opacity   = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.style.transform='translateX(-50%) translateY(80px)'; t.style.opacity='0'; }, 3000);
}

/* ─── 16. INIT ───────────────────────────────────────── */
function init() {
  buildToast();
  buildCartDrawer();
  injectCartButtons();
  wireCartIcon();
  wireSearch();
  wireSubnav();
  wireBackToTop();
  wireScrollShadow();
  wireProductScroll();
  updateCartBadge();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}