const SELECTORS = {
  backToTop: ".footpanel1",
  searchInput: ".search input",
  searchButton: ".search button",
  productCards: ".intelligence",
  greetingText: ".controls .control:first-child div:first-child",
  cart: ".cart",
  heroBanner: ".hero-bg img"
};

const HERO_BANNERS = ["bus.jpg", "banner2.jpg", "banner3.jpg"];

const state = {
  cartCount: 0,
  currentBannerIndex: 0
};

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function safeElement(selector) {
  const element = $(selector);
  if (!element) {
    console.warn(`Missing DOM element: ${selector}`);
  }
  return element;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function filterProducts(query) {
  const normalizedQuery = query.trim().toLowerCase();

  $$(SELECTORS.productCards).forEach(card => {
    const content = card.textContent.trim().toLowerCase();
    card.style.display = content.includes(normalizedQuery) ? "block" : "none";
  });
}

function updateGreeting() {
  const greetingElement = safeElement(SELECTORS.greetingText);
  if (!greetingElement) {
    return;
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  greetingElement.textContent = greeting;
}

function createCartBadge() {
  const badge = document.createElement("span");
  badge.className = "cart-badge";
  badge.textContent = state.cartCount;
  return badge;
}

function incrementCartCount(badge) {
  state.cartCount += 1;
  badge.textContent = state.cartCount;
}

function initCartCounter() {
  const cartElement = safeElement(SELECTORS.cart);
  if (!cartElement) {
    return;
  }

  const badge = createCartBadge();
  cartElement.appendChild(badge);

  $$(SELECTORS.productCards).forEach(product => {
    product.addEventListener("click", () => incrementCartCount(badge));
  });
}

function initHeroSlider() {
  const bannerImage = safeElement(SELECTORS.heroBanner);
  if (!bannerImage || HERO_BANNERS.length === 0) {
    return;
  }

  setInterval(() => {
    state.currentBannerIndex = (state.currentBannerIndex + 1) % HERO_BANNERS.length;
    bannerImage.src = HERO_BANNERS[state.currentBannerIndex];
  }, 3000);
}

function initSearch() {
  const input = safeElement(SELECTORS.searchInput);
  const button = safeElement(SELECTORS.searchButton);

  if (!input) {
    return;
  }

  input.addEventListener("input", () => filterProducts(input.value));

  if (button) {
    button.addEventListener("click", event => {
      event.preventDefault();
      filterProducts(input.value);
    });
  }
}

function initBackToTop() {
  const button = safeElement(SELECTORS.backToTop);
  if (!button) {
    return;
  }

  button.addEventListener("click", scrollToTop);
}

function logReadyMessage() {
  console.log("Amazon Clone Loaded Successfully");
}

function init() {
  initBackToTop();
  initSearch();
  updateGreeting();
  initCartCounter();
  initHeroSlider();
  logReadyMessage();
}

window.addEventListener("DOMContentLoaded", init);
