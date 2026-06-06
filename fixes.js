/* =====================================================
   fixes.js  — paste this at the BOTTOM of your script.js
   OR add <script src="fixes.js"></script> before </body>
   (must come AFTER your existing script.js)
   ===================================================== */

'use strict';

(function () {

  /* ── WAIT FOR DOM ── */
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {

    /* ═══════════════════════════════════════════════════
       FIX 3 — SEARCH: Inline suggestion dropdown
       instead of hiding/showing .intelligence cards
       which leaves a big ugly empty space
    ════════════════════════════════════════════════════ */

    const searchWrap = document.querySelector('.search');
    const searchInput = document.querySelector('.search input');
    const clearBtn    = document.getElementById('js-cls');      /* from your existing script.js */
    const banner      = document.getElementById('js-search-banner');

    if (!searchInput || !searchWrap) return;

    /* Build suggestion box */
    const box = document.createElement('div');
    box.id = 'js-suggest-box';
    searchWrap.appendChild(box);

    /* Override the existing doSearch — we replace it entirely */
    function doSearch(query) {
      query = query.trim();

      /* Always restore ALL .intelligence cards — no more hiding */
      document.querySelectorAll('.intelligence').forEach(c => c.style.display = '');

      /* Hide the old banner (we use the dropdown now) */
      if (banner) banner.style.display = 'none';
      if (clearBtn) clearBtn.closest && clearBtn.closest('#js-search-banner') && (banner.style.display = 'none');

      if (!query) {
        closeSuggest();
        return;
      }

      /* Filter products by query */
      const q = query.toLowerCase();
      const matches = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.img && p.img.toLowerCase().includes(q))
      );

      if (matches.length === 0) {
        box.innerHTML = `<div class="suggest-no-results">😕 No results for "<strong>${escHtml(query)}</strong>"</div>`;
      } else {
        box.innerHTML = matches.map(p => `
          <div class="suggest-item" data-id="${p.id}">
            <img src="${p.img}" alt="${escHtml(p.title)}"
                 onerror="this.src='https://via.placeholder.com/46?text=P'" />
            <div class="suggest-item-info">
              <div class="suggest-item-title">${highlight(p.title, query)}</div>
              <div class="suggest-item-price">₹${p.price.toLocaleString('en-IN')}</div>
            </div>
            <button class="suggest-item-add" data-id="${p.id}">Add to Cart</button>
          </div>`).join('');
      }

      openSuggest();
    }

    function openSuggest()  { box.classList.add('open'); }
    function closeSuggest() { box.classList.remove('open'); }

    function highlight(text, query) {
      if (!query) return escHtml(text);
      const re = new RegExp('(' + escRegex(query) + ')', 'gi');
      return escHtml(text).replace(re, '<mark style="background:#ffd54f;border-radius:2px;padding:0 1px">$1</mark>');
    }

    function escHtml(s) {
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function escRegex(s) {
      return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /* Re-wire search events to our new doSearch */
    searchInput.addEventListener('input',   () => doSearch(searchInput.value));
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(searchInput.value); if (e.key === 'Escape') closeSuggest(); });
    document.querySelector('.search button') &&
      document.querySelector('.search button').addEventListener('click', () => doSearch(searchInput.value));

    /* Clear button */
    searchInput.addEventListener('input', () => {
      if (!searchInput.value.trim()) closeSuggest();
    });

    /* Click on suggest item → Add to Cart */
    box.addEventListener('click', e => {
      const addBtn = e.target.closest('.suggest-item-add');
      const item   = e.target.closest('.suggest-item');
      if (addBtn && typeof addToCart === 'function') {
        addToCart(addBtn.dataset.id);
        addBtn.textContent = '✓ Added';
        addBtn.style.background = '#2e7d32';
        addBtn.style.color = '#fff';
        setTimeout(() => { addBtn.textContent = 'Add to Cart'; addBtn.style.background=''; addBtn.style.color=''; }, 2000);
      } else if (item && !addBtn) {
        /* Clicking anywhere else on item scrolls to the product */
        const target = document.querySelector(`.js-add-btn[data-id="${item.dataset.id}"]`);
        if (target) { target.closest('.intelligence').scrollIntoView({ behavior: 'smooth', block: 'center' }); closeSuggest(); }
      }
    });

    /* Close suggest on click outside */
    document.addEventListener('click', e => {
      if (!searchWrap.contains(e.target)) closeSuggest();
    });

    /* Also wire the existing clear button to close suggest */
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        closeSuggest();
        document.querySelectorAll('.intelligence').forEach(c => c.style.display = '');
      });
    }

    /* ═══════════════════════════════════════════════════
       FIX 4 — LANG/COUNTRY DROPDOWN: close on outside click
       The CSS :focus-within approach works but doesn't
       close when clicking elsewhere — JS fixes that
    ════════════════════════════════════════════════════ */

    document.querySelectorAll('.lang-wrapper').forEach(wrapper => {
      const btn      = wrapper.querySelector('.lang-btn');
      const dropdown = wrapper.querySelector('.lang-dropdown');
      if (!btn || !dropdown) return;

      let isOpen = false;

      btn.addEventListener('click', e => {
        e.stopPropagation();
        isOpen = !isOpen;
        dropdown.style.display = isOpen ? 'block' : 'none';

        /* Close other open dropdowns */
        document.querySelectorAll('.lang-wrapper .lang-dropdown').forEach(d => {
          if (d !== dropdown) d.style.display = 'none';
        });
      });

      /* Close on outside click */
      document.addEventListener('click', () => {
        isOpen = false;
        dropdown.style.display = 'none';
      });

      /* Stop dropdown click from bubbling to document */
      dropdown.addEventListener('click', e => e.stopPropagation());
    });

    /* ═══════════════════════════════════════════════════
       FIX 1 — Back-to-top wiring (in case not already done)
    ════════════════════════════════════════════════════ */
    const backBtn = document.querySelector('.footpanel1');
    if (backBtn && !backBtn.dataset.wired) {
      backBtn.dataset.wired = '1';
      backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

  }); /* end ready() */

})();