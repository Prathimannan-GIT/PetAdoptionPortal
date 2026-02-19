/*
 PetAdopt (HTML/CSS/JS only)
 - No backend: roles + data simulated with localStorage
 - Modules: user, shelter, admin
 - Pages: index, login, register, dashboard, adopt, pet-details, apply, shelter-dashboard, admin, about, contact, privacy, terms
*/

(() => {
  'use strict';

  const LS = {
    AUTH: 'pap_auth',
    USERS: 'pap_users',
    SHELTERS: 'pap_shelters',
    PETS: 'pap_pets',
    APPS: 'pap_applications'
  };

  const ROUTES = {
    home: 'index.html',
    home2: 'home2.html',
    login: 'login.html',
    register: 'login.html#register',
    dashboard: 'dashboard.html',
    adopt: 'adopt.html',
    pet: 'pet-details.html',
    apply: 'apply.html',
    shelter: 'shelter-dashboard.html',
    admin: 'admin.html',
    about: 'about.html',
    services: 'services.html',
    pricing: 'pricing.html',
    blog: 'blog.html',
    blogDetails: 'blog-details.html',
    contact: 'contact.html',
    privacy: 'privacy.html',
    terms: 'terms.html',
    notFound: '404.html',
    comingSoon: 'coming-soon.html'
  };

  const DEMO_ADMIN = {
    id: 'admin-1',
    name: 'Platform Admin',
    email: 'admin@petportal.org',
    password: 'Admin@123',
    role: 'admin',
    blocked: false
  };

  /* -------------------- Utilities -------------------- */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function uid(prefix) {
    return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
  }

  function isoNow() {
    return new Date().toISOString();
  }

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function currentFile() {
    return (location.pathname.split('/').pop() || ROUTES.home).toLowerCase();
  }

  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function normalizeImageUrl(url) {
    if (!url || url.trim() === '') {
      // Use placeholder images for missing/broken images
      return 'placeholder-pet.svg';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('data:')) return url;
    return url;
  }

  function fallbackImageDataUri(type = 'pet') {
    if (type === 'hero') {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7fbff"/><stop offset="0.55" stop-color="#f3fff6"/><stop offset="1" stop-color="#f7fbff"/></linearGradient><linearGradient id="a" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#22c55e" stop-opacity="0.85"/><stop offset="1" stop-color="#0ea5e9" stop-opacity="0.85"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><g opacity="0.18"><path d="M0 560 C 160 480, 360 640, 560 560 S 920 480, 1200 560" fill="none" stroke="url(#a)" stroke-width="14"/></g><g><text x="70" y="130" fill="#0b1b2c" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="900">PetAdopt</text><text x="70" y="180" fill="#245" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" opacity="0.75">Find Your Perfect Companion</text></g></svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    } else {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7fbff"/><stop offset="0.55" stop-color="#f3fff6"/><stop offset="1" stop-color="#f7fbff"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><g transform="translate(50 80)"><rect x="0" y="0" width="300" height="140" rx="20" fill="#ffffff" opacity="0.86" stroke="#0ea5e9" stroke-opacity="0.25"/><g transform="translate(40 35)" fill="none" stroke="#0b1b2c" stroke-opacity="0.7" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M60 80c-9 5-15 14-15 25 0 17 17 31 40 31s40-14 40-31c0-11-6-20-15-25-7-4-14-2-25 4-11-6-18-8-25-4z"/><circle cx="60" cy="33" r="10"/><circle cx="87" cy="23" r="10"/><circle cx="114" cy="23" r="10"/><circle cx="141" cy="33" r="10"/></g></g></svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
  }

  function initMediaFallbacks() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add error handler for fallback
      img.addEventListener('error', function () {
        if (!this.dataset.fallbackApplied) {
          this.dataset.fallbackApplied = 'true';
          const isHero = this.classList.contains('hero-image') || this.closest('.hero');
          this.src = fallbackImageDataUri(isHero ? 'hero' : 'pet');
          this.style.objectFit = 'cover';
        }
      });

      // Check if image is already broken
      if (!this.complete || this.naturalHeight === 0) {
        const isHero = this.classList.contains('hero-image') || this.closest('.hero');
        this.src = fallbackImageDataUri(isHero ? 'hero' : 'pet');
        this.style.objectFit = 'cover';
      }
    });
  }

  /* -------------------- Modal -------------------- */

  function ensureModal() {
    let modal = $('#papModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'papModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="papModalTitle">
        <div class="modal-head">
          <h3 id="papModalTitle">Message</h3>
          <button class="modal-close" type="button" aria-label="Close">✕</button>
        </div>
        <div class="modal-body" id="papModalBody"></div>
        <div class="modal-foot">
          <button class="btn btn-primary" type="button" id="papModalOk"><i class="fa-solid fa-check"></i> OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.classList.remove('open');
    $('.modal-close', modal).addEventListener('click', close);
    $('#papModalOk', modal).addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    return modal;
  }

  function showModal(title, message) {
    const modal = ensureModal();
    $('#papModalTitle', modal).textContent = String(title || 'Message');
    $('#papModalBody', modal).innerHTML = `<p style="margin:0;">${escapeHtml(message || '')}</p>`;
    modal.classList.add('open');
  }

  /* -------------------- Validation -------------------- */

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  function validatePassword(pw) {
    const s = String(pw || '');
    if (s.length < 8) return false;
    if (!/[a-z]/.test(s)) return false;
    if (!/[A-Z]/.test(s)) return false;
    if (!/[0-9]/.test(s)) return false;
    if (!/[^A-Za-z0-9]/.test(s)) return false;
    return true;
  }

  function clearErrors(form) {
    $$('.error-text', form).forEach(n => n.remove());
    $$('.error', form).forEach(el => el.classList.remove('error'));
  }

  function setError(field, msg) {
    field.classList.add('error');
    const p = document.createElement('p');
    p.className = 'error-text';
    p.textContent = msg;

    // For checkboxes in a flex container (like auth-checkbox), put error after the container
    if (field.type === 'checkbox' && field.parentElement.classList.contains('auth-checkbox')) {
      field.parentElement.insertAdjacentElement('afterend', p);
    } else {
      field.insertAdjacentElement('afterend', p);
    }
  }

  function validateForm(form) {
    clearErrors(form);
    let ok = true;

    $$('[required]', form).forEach(field => {
      if (field.type === 'checkbox') {
        if (!field.checked) {
          ok = false;
          setError(field, 'You must agree to the Terms & Conditions.');
        }
      } else {
        const v = String(field.value || '').trim();
        if (!v) {
          ok = false;
          setError(field, 'This field is required.');
        }
      }
    });

    const email = $('input[type="email"]', form);
    if (email && email.value && !validateEmail(email.value)) {
      ok = false;
      setError(email, 'Enter a valid email address.');
    }

    const pw = $('input[name="password"]', form);
    if (pw && pw.value && !validatePassword(pw.value)) {
      ok = false;
      setError(pw, 'Password must be 8+ chars and include upper, lower, number, and a symbol.');
    }

    const cpw = $('input[name="confirmPassword"]', form);
    if (cpw && pw && cpw.value && pw.value !== cpw.value) {
      ok = false;
      setError(cpw, 'Passwords do not match.');
    }

    return ok;
  }

  /* -------------------- Auth -------------------- */

  function getAuth() {
    return read(LS.AUTH, null);
  }

  function setAuth(auth) {
    write(LS.AUTH, auth);
  }

  function logout() {
    localStorage.removeItem(LS.AUTH);
  }

  function requireAuth(roles) {
    const a = getAuth();
    if (!a) {
      location.href = `${ROUTES.login}?next=${encodeURIComponent(currentFile())}`;
      return null;
    }
    if (Array.isArray(roles) && roles.length && !roles.includes(a.role)) {
      location.href = ROUTES.dashboard;
      return null;
    }
    return a;
  }

  function findAccountByEmail(email) {
    const e = String(email || '').trim().toLowerCase();
    if (!e) return null;

    if (e === DEMO_ADMIN.email.toLowerCase()) return { ...DEMO_ADMIN, accountType: 'admin' };

    const users = read(LS.USERS, []);
    const shelters = read(LS.SHELTERS, []);

    const u = users.find(x => String(x.email).toLowerCase() === e);
    if (u) return { ...u, accountType: 'user' };

    const s = shelters.find(x => String(x.email).toLowerCase() === e);
    if (s) return { ...s, accountType: 'shelter' };

    return null;
  }

  /* -------------------- Reset Functions -------------------- */

  function resetPetData() {
    // Clear existing pets from localStorage
    localStorage.removeItem(LS.PETS);
    // Re-run seed to create fresh pet data
    ensureSeed();
    showModal('Pet Data Reset', 'Pet data has been reset. Refresh the page to see changes.');
  }

  /* -------------------- Seed Data -------------------- */

  function ensureSeed() {
    const users = read(LS.USERS, []);
    const shelters = read(LS.SHELTERS, []);
    const pets = read(LS.PETS, []);
    const apps = read(LS.APPS, []);

    if (!shelters.length) {
      shelters.push(
        {
          id: 'shelter-1',
          name: 'Green Paws Rescue',
          email: 'greenpaws@shelter.org',
          password: 'Shelter@123',
          phone: '+1 (555) 220-1180',
          city: 'Riverdale',
          approved: true,
          blocked: false,
          createdAt: isoNow()
        },
        {
          id: 'shelter-2',
          name: 'Sunny Tails Haven',
          email: 'sunnytails@shelter.org',
          password: 'Shelter@123',
          phone: '+1 (555) 220-1189',
          city: 'Laketown',
          approved: false,
          blocked: false,
          createdAt: isoNow()
        }
      );
    }

    if (!users.length) {
      users.push({
        id: 'user-1',
        name: 'Aarav Singh',
        email: 'aarav@petportal-mail.com',
        password: 'User@1234',
        phone: '+1 (555) 110-2401',
        city: 'Riverdale',
        role: 'user',
        blocked: false,
        createdAt: isoNow()
      });
    }

    if (!pets.length) {
      pets.push(
        {
          id: 'pet-101',
          name: 'Milo',
          species: 'Dog',
          breed: 'Labrador Mix',
          gender: 'Male',
          ageMonths: 18,
          size: 'Medium',
          color: 'Golden',
          vaccinated: true,
          neutered: true,
          energy: 'Playful',
          goodWithKids: true,
          goodWithPets: true,
          shelterId: 'shelter-1',
          location: 'Riverdale',
          status: 'available',
          story: 'Milo is confident, affectionate, and eager to learn. He loves fetch and settles quickly once he trusts you.',
          traits: ['Great leash manners', 'Food motivated', 'Friendly with visitors'],
          images: [
            'images/pic.jpg',
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b'
          ],
          createdAt: isoNow()
        },
        {
          id: 'pet-102',
          name: 'Luna',
          species: 'Cat',
          breed: 'Domestic Shorthair',
          gender: 'Female',
          ageMonths: 10,
          size: 'Small',
          color: 'Grey',
          vaccinated: true,
          neutered: true,
          energy: 'Calm',
          goodWithKids: true,
          goodWithPets: false,
          shelterId: 'shelter-1',
          location: 'Riverdale',
          status: 'available',
          story: 'Luna is a gentle lap cat who enjoys window watching and quiet corners. She thrives in calm homes.',
          traits: ['Indoor-only', 'Litter trained', 'Prefers a single-pet home'],
          images: [
            'images/pic2.jpg',
            'https://images.unsplash.com/photo-1516972810927-80185027ca84'
          ],
          createdAt: isoNow()
        },
        {
          id: 'pet-104',
          name: 'Pepper',
          species: 'Cat',
          breed: 'Tuxedo',
          gender: 'Male',
          ageMonths: 22,
          size: 'Medium',
          color: 'Black & White',
          vaccinated: true,
          neutered: true,
          energy: 'Curious',
          goodWithKids: true,
          goodWithPets: true,
          shelterId: 'shelter-2',
          location: 'Laketown',
          status: 'available',
          story: 'Pepper is confident and affectionate. He loves interactive toys and following you from room to room.',
          traits: ['Talkative', 'Food motivated', 'Enjoys playtime'],
          images: [
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
            'https://images.unsplash.com/photo-1543852786-1cf6624b9987'
          ],
          createdAt: isoNow()
        },
        {
          id: 'pet-105',
          name: 'Kiwi',
          species: 'Dog',
          breed: 'Australian Shepherd',
          gender: 'Male',
          ageMonths: 14,
          size: 'Medium',
          color: 'Brown',
          vaccinated: true,
          neutered: true,
          energy: 'High',
          goodWithKids: false,
          goodWithPets: true,
          shelterId: 'shelter-2',
          location: 'Laketown',
          status: 'available',
          story: 'Kiwi is smart and driven. He does best with active adopters who enjoy training and structured play.',
          traits: ['Loves puzzles', 'Fast learner', 'Needs exercise'],
          images: [
            'https://media.istockphoto.com/id/636475496/photo/portrait-of-brown-puppy-with-bokeh-background.jpg?s=612x612&w=0&k=20&c=Ot63dQOYplm0kLJdlSVWbtKGwGkuZfnfdwH5ry9a6EQ='
          ],
          createdAt: isoNow()
        },

      );
    }

    // Auto-fix: Remove Bella (p-106) if she exists (cleanup)
    const currentPets = read(LS.PETS, []);

    // Auto-fix: Update Kiwi's image if it exists (for existing users)
    const kiwi = currentPets.find(p => p.id === 'pet-105' || p.name === 'Kiwi');
    if (kiwi) {
      kiwi.images = ['https://media.istockphoto.com/id/636475496/photo/portrait-of-brown-puppy-with-bokeh-background.jpg?s=612x612&w=0&k=20&c=Ot63dQOYplm0kLJdlSVWbtKGwGkuZfnfdwH5ry9a6EQ='];
      kiwi.color = 'Brown';
      kiwi.breed = 'Australian Shepherd';
      write(LS.PETS, currentPets);
    }

    const bellaIndex = currentPets.findIndex(p => p.id === 'pet-106');
    if (bellaIndex !== -1) {
      currentPets.splice(bellaIndex, 1);
      write(LS.PETS, currentPets);
    }

    if (!Array.isArray(apps)) write(LS.APPS, []);

    write(LS.USERS, users);
    write(LS.SHELTERS, shelters);
    write(LS.PETS, pets);
    write(LS.APPS, apps);
  }

  /* -------------------- UI: Header/Footer -------------------- */

  function renderLayout() {
    const headerHost = $('#siteHeader');
    const footerHost = $('#siteFooter');
    if (!headerHost || !footerHost) return;

    const path = currentFile();
    // Hide header and footer on auth pages as per request
    if (path === ROUTES.login || path === ROUTES.register || path === 'register.html') {
      headerHost.innerHTML = '';
      footerHost.innerHTML = '';
      return;
    }

    const auth = getAuth();

    const nav = [
      { href: ROUTES.home, label: 'Home 1' },
      { href: ROUTES.home2, label: 'Home 2' },
      { href: ROUTES.adopt, label: 'Adopt' },
      { href: ROUTES.services, label: 'Services' },
      { href: ROUTES.blog, label: 'Blog' },
      { href: ROUTES.about, label: 'About' },
      { href: ROUTES.contact, label: 'Contact' }
    ];

    const isActive = (href) => path === href.toLowerCase();

    headerHost.innerHTML = `
      <header class="site-header">
        <div class="container">
          <div class="navbar">
            <div class="navbar-left">
              <a class="brand" href="${ROUTES.home}" aria-label="PetAdopt">
                <span class="brand-badge"><i class="fa-solid fa-paw"></i></span>
                <span style="font-family: var(--font-display); font-weight: 1000;">PetAdopt</span>
              </a>
            </div>

            <div class="navbar-center">
              <nav class="nav-links" id="navLinks" aria-label="Primary">
                ${nav.map(l => `
                  <a href="${l.href}" class="${isActive(l.href) ? 'active' : ''}">
                    ${l.label}
                  </a>
                `).join('')}
                
                <!-- Mobile-only Auth Section -->
                <div class="mobile-only-auth" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 12px;">
                  ${auth ? `
                    <a href="${ROUTES.dashboard}" class="${isActive(ROUTES.dashboard) ? 'active' : ''}">
                      <i class="fa-solid fa-gauge"></i> Dashboard
                    </a>
                    <button id="mobileLogoutBtn" class="btn btn-secondary" style="width: 100%; justify-content: center;">
                      <i class="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                  ` : `
                    <a href="${ROUTES.login}" class="btn btn-primary" style="width: 100%; justify-content: center;">
                      <i class="fa-solid fa-user-plus"></i> Join Now
                    </a>
                  `}
                </div>
              </nav>
            </div>

            <div class="navbar-right">
              <div class="nav-actions">
                ${auth ? `
                  <span class="badge" title="Logged in">
                    <i class="fa-solid fa-user"></i>
                    ${escapeHtml(auth.name || 'Account')}
                  </span>
                  <button id="logoutBtn" class="btn btn-secondary btn-sm">Logout</button>
                ` : `
                  <a href="${ROUTES.login}" class="btn btn-primary">
                    <i class="fa-solid fa-user-plus"></i> Join Now
                  </a>
                `}
                <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
                  <i class="fa-solid fa-moon"></i>
                </button>
                <button class="mobile-toggle" id="mobileToggle" aria-label="Open menu">
                  <span></span><span></span><span></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    `;

    footerHost.innerHTML = `
      <footer class="site-footer" style="font-family: var(--font-display);">
        <div class="container">
          <div class="footer-top">
            <div class="footer-brand">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <span class="brand-badge"><i class="fa-solid fa-paw"></i></span>
                <span style="font-family: var(--font-display); font-weight: 1000; font-size: 1.5rem; color: var(--text);">PetAdopt</span>
              </div>
              <p style="color:var(--muted);font-weight:500;line-height:1.6;margin-bottom:24px;">
                Connecting loving families with pets in need. Every adoption creates a forever home and changes a life forever.
              </p>
              <div class="footer-stats" style="display:flex;gap:24px;margin-bottom:24px;">
                <div style="text-align:center;">
                  <div style="font-size:1.5rem;font-weight:900;color:var(--primary);">10K+</div>
                  <div style="font-size:0.85rem;color:var(--muted);font-weight:500;">Pets Adopted</div>
                </div>
                <div style="text-align:center;">
                  <div style="font-size:1.5rem;font-weight:900;color:var(--primary-2);">500+</div>
                  <div style="font-size:0.85rem;color:var(--muted);font-weight:500;">Partner Shelters</div>
                </div>
                <div style="text-align:center;">
                  <div style="font-size:1.5rem;font-weight:900;color:var(--warning);">98%</div>
                  <div style="font-size:0.85rem;color:var(--muted);font-weight:500;">Success Rate</div>
                </div>
              </div>
              <div class="social-links">
                <h4 style="margin:0 0 16px;font-weight:900;color:var(--text);">Follow Our Journey</h4>
                <div class="social" style="display:flex;gap:12px;">
                  <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram" class="social-icon instagram">
                    <i class="fa-brands fa-instagram"></i>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook" class="social-icon facebook">
                    <i class="fa-brands fa-facebook"></i>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter" class="social-icon twitter">
                    <i class="fa-brands fa-x-twitter"></i>
                  </a>
                  <a href="https://wa.me/15559012277" target="_blank" rel="noopener" aria-label="WhatsApp" class="social-icon whatsapp">
                    <i class="fa-brands fa-whatsapp"></i>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube" class="social-icon youtube">
                    <i class="fa-brands fa-youtube"></i>
                  </a>
                </div>
              </div>
            </div>

            <div class="footer-section">
              <h4 style="margin:0 0 20px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-compass" style="color:var(--primary);font-size:0.9rem;"></i>
                Explore
              </h4>
              <ul style="list-style:none;padding:0;margin:0;display:grid;gap:12px;">
                <li><a href="${ROUTES.home}" style="display:flex;align-items:center;gap:8px;color:var(--muted);text-decoration:none;font-weight:500;transition:color var(--t-fast);"><i class="fa-solid fa-house" style="font-size:0.8rem;color:var(--primary);"></i> Home</a></li>
                <li><a href="${ROUTES.adopt}" style="display:flex;align-items:center;gap:8px;color:var(--muted);text-decoration:none;font-weight:500;transition:color var(--t-fast);"><i class="fa-solid fa-paw" style="font-size:0.8rem;color:var(--primary);"></i> Browse Pets</a></li>
                <li><a href="${ROUTES.services}" style="display:flex;align-items:center;gap:8px;color:var(--muted);text-decoration:none;font-weight:500;transition:color var(--t-fast);"><i class="fa-solid fa-heart" style="font-size:0.8rem;color:var(--primary);"></i> Services</a></li>
                <li><a href="${ROUTES.blog}" style="display:flex;align-items:center;gap:8px;color:var(--muted);text-decoration:none;font-weight:500;transition:color var(--t-fast);"><i class="fa-solid fa-newspaper" style="font-size:0.8rem;color:var(--primary);"></i> Blog & Stories</a></li>
                <li><a href="${ROUTES.about}" style="display:flex;align-items:center;gap:8px;color:var(--muted);text-decoration:none;font-weight:500;transition:color var(--t-fast);"><i class="fa-solid fa-info-circle" style="font-size:0.8rem;color:var(--primary);"></i> About Us</a></li>
              </ul>
            </div>

            <div class="footer-section">
              <h4 style="margin:0 0 20px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-life-ring" style="color:var(--primary-2);font-size:0.9rem;"></i>
                Support
              </h4>
              <ul style="list-style:none;padding:0;margin:0;display:grid;gap:12px;">
                <li><a href="${ROUTES.contact}" style="display:flex;align-items:center;gap:8px;color:var(--muted);text-decoration:none;font-weight:500;transition:color var(--t-fast);"><i class="fa-solid fa-envelope" style="font-size:0.8rem;color:var(--primary-2);"></i> Contact Us</a></li>
                <li><a href="${ROUTES.privacy}" style="display:flex;align-items:center;gap:8px;color:var(--muted);text-decoration:none;font-weight:500;transition:color var(--t-fast);"><i class="fa-solid fa-shield-alt" style="font-size:0.8rem;color:var(--primary-2);"></i> Privacy Policy</a></li>
                <li><a href="${ROUTES.terms}" style="display:flex;align-items:center;gap:8px;color:var(--muted);text-decoration:none;font-weight:500;transition:color var(--t-fast);"><i class="fa-solid fa-file-contract" style="font-size:0.8rem;color:var(--primary-2);"></i> Terms of Service</a></li>
                <li><a href="#" style="display:flex;align-items:center;gap:8px;color:var(--muted);text-decoration:none;font-weight:500;transition:color var(--t-fast);"><i class="fa-solid fa-question-circle" style="font-size:0.8rem;color:var(--primary-2);"></i> FAQ</a></li>
                <li><a href="#" style="display:flex;align-items:center;gap:8px;color:var(--muted);text-decoration:none;font-weight:500;transition:color var(--t-fast);"><i class="fa-solid fa-headset" style="font-size:0.8rem;color:var(--primary-2);"></i> Get Help</a></li>
              </ul>
            </div>

            <div class="footer-section">
              <h4 style="margin:0 0 20px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-bell" style="color:var(--warning);font-size:0.9rem;"></i>
                Stay Connected
              </h4>
              <p style="color:var(--muted);font-weight:500;line-height:1.6;margin-bottom:16px;">
                Get updates about new pets, adoption tips, and heartwarming stories delivered to your inbox.
              </p>
              <div class="newsletter-form" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;">
                <form style="display:flex;flex-direction:column;gap:12px;">
                  <input type="email" placeholder="Your email address" style="flex:1;padding:12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:inherit;font-size:0.9rem;background:var(--surface-strong);color:var(--text);">
                  <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;font-weight:600;">
                    <i class="fa-solid fa-paper-plane"></i> Subscribe
                  </button>
                </form>
                <p style="font-size:0.8rem;color:var(--muted);margin:8px 0 0;text-align:center;">
                  Join 50,000+ pet lovers. No spam, ever.
                </p>
              </div>
            </div>
          </div>

          <div class="footer-middle">
            <div class="footer-features">
              <div style="display:flex;align-items:center;gap:12px;">
                <i class="fa-solid fa-shield-heart" style="color:var(--primary);font-size:1.2rem;"></i>
                <div>
                  <div style="font-weight:700;color:var(--text);margin-bottom:2px;">Verified Shelters</div>
                  <div style="font-size:0.85rem;color:var(--muted);font-weight:500;">All partner shelters are thoroughly vetted</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <i class="fa-solid fa-hand-holding-heart" style="color:var(--primary-2);font-size:1.2rem;"></i>
                <div>
                  <div style="font-weight:700;color:var(--text);margin-bottom:2px;">Responsible Adoption</div>
                  <div style="font-size:0.85rem;color:var(--muted);font-weight:500;">We ensure safe and loving homes</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <i class="fa-solid fa-clock" style="color:var(--warning);font-size:1.2rem;"></i>
                <div>
                  <div style="font-weight:700;color:var(--text);margin-bottom:2px;">24/7 Support</div>
                  <div style="font-size:0.85rem;color:var(--muted);font-weight:500;">Always here to help you and your pet</div>
                </div>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
              <div style="color:var(--muted);font-weight:500;font-size:0.9rem;">
                © ${new Date().getFullYear()} PetAdopt. Made with <i class="fa-solid fa-heart" style="color:var(--danger);"></i> for pets and families.
              </div>
              <div style="display:flex;gap:16px;align-items:center;">
                <span style="color:var(--muted);font-weight:500;font-size:0.85rem;">Payment methods:</span>
                <div style="display:flex;gap:8px;">
                  <i class="fa-brands fa-cc-visa" style="color:var(--muted);font-size:1.2rem;"></i>
                  <i class="fa-brands fa-cc-mastercard" style="color:var(--muted);font-size:1.2rem;"></i>
                  <i class="fa-brands fa-cc-amex" style="color:var(--muted);font-size:1.2rem;"></i>
                  <i class="fa-brands fa-cc-paypal" style="color:var(--muted);font-size:1.2rem;"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;

    const navLinks = $('#navLinks');
    const mobileToggle = $('#mobileToggle');
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        mobileToggle.classList.toggle('active');
        // Prevent background scroll when menu is open
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
      });
    }

    // Logout logic for both buttons
    const handleLogout = () => {
      logout();
      location.href = ROUTES.home;
    };

    const logoutBtn = $('#logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const mobileLogoutBtn = $('#mobileLogoutBtn');
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

  }


  /* -------------------- Media fallbacks -------------------- */

  function initMediaFallbacks() {
    const fb = fallbackImageDataUri();
    $$('img').forEach(img => {
      if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
      const src = img.getAttribute('src');
      if (src) img.src = normalizeImageUrl(src);
      img.addEventListener('error', () => {
        if (img.dataset.fallback === '1') return;
        img.dataset.fallback = '1';
        img.src = fb;
      });
    });
  }

  /* -------------------- Pet rendering -------------------- */

  function ageLabel(months) {
    const m = Number(months || 0);
    if (m < 12) return `${m} months`;
    const y = Math.floor(m / 12);
    const r = m % 12;
    return r ? `${y}y ${r}m` : `${y} years`;
  }

  function petCard(p) {
    const img = normalizeImageUrl(p.images?.[0] || '');
    return `
      <article class="pet-card" data-pet-id="${escapeHtml(p.id)}">
        <div class="pet-media">
          <img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)} - ${escapeHtml(p.species)}" />
        </div>
        <div class="pet-body">
          <div class="pet-title">
            <h3>${escapeHtml(p.name)}</h3>
            <span class="pill"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.location)}</span>
          </div>
          <div class="pet-meta">
            <span><i class="fa-solid fa-paw"></i> ${escapeHtml(p.species)}</span>
            <span><i class="fa-solid fa-cake-candles"></i> ${escapeHtml(ageLabel(p.ageMonths))}</span>
            <span><i class="fa-solid fa-venus-mars"></i> ${escapeHtml(p.gender)}</span>
          </div>
          <p style="margin:0;color:var(--muted);font-weight:750;">${escapeHtml(p.breed)} • Energy: ${escapeHtml(p.energy)}</p>
          <div class="pet-actions">
            <a class="btn btn-secondary" href="${ROUTES.pet}?id=${encodeURIComponent(p.id)}"><i class="fa-solid fa-circle-info"></i> Details</a>
            <a class="btn btn-primary" href="${ROUTES.apply}?petId=${encodeURIComponent(p.id)}"><i class="fa-solid fa-file-signature"></i> Apply</a>
          </div>
        </div>
      </article>
    `;
  }

  function listPets(filter) {
    const all = read(LS.PETS, []).filter(p => p.status === 'available');
    const species = filter?.species || 'all';
    const location = filter?.location || 'all';
    const search = (filter?.search || '').toLowerCase();

    return all.filter(p => {
      if (species !== 'all' && p.species !== species) return false;
      if (location !== 'all' && p.location !== location) return false;
      if (search) {
        const blob = `${p.name} ${p.breed} ${p.species} ${p.location}`.toLowerCase();
        if (!blob.includes(search)) return false;
      }
      return true;
    });
  }

  function getPet(id) {
    return read(LS.PETS, []).find(p => p.id === id) || null;
  }

  /* -------------------- Pages -------------------- */

  function initIndex() {
    const featured = $('#featuredPets');
    if (featured) {
      featured.innerHTML = listPets({}).slice(0, 4).map(petCard).join('');
    }

    const stats = $('#heroStats');
    if (stats) {
      const pets = read(LS.PETS, []);
      const apps = read(LS.APPS, []);
      const shelters = read(LS.SHELTERS, []);
      stats.innerHTML = `
        <div class="stat-card"><strong>${pets.filter(p => p.status === 'available').length}</strong><span>Available pets</span></div>
        <div class="stat-card"><strong>${apps.length}</strong><span>Total applications</span></div>
        <div class="stat-card"><strong>${shelters.filter(s => s.approved).length}</strong><span>Verified shelters</span></div>
        <div class="stat-card"><strong>${pets.filter(p => p.status === 'adopted').length}</strong><span>Adoptions</span></div>
      `;
    }
  }

  function initAdopt() {
    const grid = $('#petGrid');
    if (!grid) return;

    const sp = $('#filterSpecies');
    const loc = $('#filterLocation');
    const search = $('#filterSearch');

    const render = () => {
      const pets = listPets({
        species: sp?.value || 'all',
        location: loc?.value || 'all',
        search: search?.value || ''
      });

      const count = $('#petCount');
      if (count) count.textContent = String(pets.length);

      grid.innerHTML = pets.map(petCard).join('') || `
        <div class="card card-pad" style="grid-column:1/-1;text-align:center;">
          <h3 style="margin:0;font-family:var(--font-display);font-weight:1000;">No pets match your filters</h3>
          <p style="margin:8px 0 0;color:var(--muted);font-weight:750;">Try clearing your search or choosing a different location.</p>
        </div>
      `;
    };

    sp?.addEventListener('change', render);
    loc?.addEventListener('change', render);
    search?.addEventListener('input', render);
    render();
  }

  function initPetDetails() {
    const host = $('#petDetails');
    if (!host) return;

    const id = qs('id');
    const pet = id ? getPet(id) : null;

    if (!pet) {
      host.innerHTML = `
        <div class="card card-pad" style="text-align:center;">
          <h2 style="margin:0;font-family:var(--font-display);font-weight:1000;">Pet not found</h2>
          <p style="margin:10px 0 0;color:var(--muted);font-weight:750;">The pet profile may have been removed or the link is incorrect.</p>
          <div style="margin-top:14px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
            <a class="btn btn-primary" href="${ROUTES.adopt}"><i class="fa-solid fa-paw"></i> Back to Adopt</a>
            <a class="btn btn-secondary" href="${ROUTES.home}"><i class="fa-solid fa-house"></i> Home</a>
          </div>
        </div>
      `;
      return;
    }

    const img0 = normalizeImageUrl(pet.images?.[0] || '');
    const img1 = normalizeImageUrl(pet.images?.[1] || pet.images?.[0] || '');

    host.innerHTML = `
      <div class="grid grid-2">
        <div class="card" style="overflow:hidden;border-radius:22px;">
          <div style="height:360px;">
            <img src="${escapeHtml(img0)}" alt="${escapeHtml(pet.name)}" style="height:360px;width:100%;object-fit:cover;" />
          </div>
          <div style="padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <img src="${escapeHtml(img1)}" alt="${escapeHtml(pet.name)} secondary" style="height:150px;width:100%;object-fit:cover;border-radius:16px;" />
            <div class="card" style="padding:14px;border-radius:16px;box-shadow:none;">
              <span class="badge"><i class="fa-solid fa-shield-heart"></i> Verified shelter listing</span>
              <p style="margin:10px 0 0;color:var(--muted);font-weight:750;">Always meet the pet at the shelter before final approval.</p>
            </div>
          </div>
        </div>

        <div class="card card-pad">
          <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start;">
            <div>
              <h2 style="margin:0;font-family:var(--font-display);font-weight:1000;letter-spacing:-0.6px;">${escapeHtml(pet.name)}</h2>
              <p style="margin:6px 0 0;color:var(--muted);font-weight:800;">${escapeHtml(pet.species)} • ${escapeHtml(pet.breed)} • ${escapeHtml(pet.location)}</p>
            </div>
            <span class="badge"><i class="fa-solid fa-circle-check"></i> Available</span>
          </div>

          <div class="grid grid-2" style="margin-top:14px;">
            <div class="card" style="padding:14px;border-radius:16px;box-shadow:none;">
              <strong>Age</strong>
              <p style="margin:6px 0 0;color:var(--muted);font-weight:800;">${escapeHtml(ageLabel(pet.ageMonths))}</p>
            </div>
            <div class="card" style="padding:14px;border-radius:16px;box-shadow:none;">
              <strong>Energy</strong>
              <p style="margin:6px 0 0;color:var(--muted);font-weight:800;">${escapeHtml(pet.energy)}</p>
            </div>
            <div class="card" style="padding:14px;border-radius:16px;box-shadow:none;">
              <strong>Good with kids</strong>
              <p style="margin:6px 0 0;color:var(--muted);font-weight:800;">${pet.goodWithKids ? 'Yes' : 'No'}</p>
            </div>
            <div class="card" style="padding:14px;border-radius:16px;box-shadow:none;">
              <strong>Good with pets</strong>
              <p style="margin:6px 0 0;color:var(--muted);font-weight:800;">${pet.goodWithPets ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <h3 style="margin:18px 0 8px;font-family:var(--font-display);font-weight:1000;">About ${escapeHtml(pet.name)}</h3>
          <p style="margin:0;color:var(--muted);font-weight:750;">${escapeHtml(pet.story)}</p>

          <h3 style="margin:18px 0 8px;font-family:var(--font-display);font-weight:1000;">Traits</h3>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            ${(pet.traits || []).map(t => `<span class="badge"><i class="fa-solid fa-sparkles"></i> ${escapeHtml(t)}</span>`).join('')}
          </div>

          <div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap;">
            <a class="btn btn-primary" href="${ROUTES.apply}?petId=${encodeURIComponent(pet.id)}"><i class="fa-solid fa-file-signature"></i> Apply to Adopt</a>
            <a class="btn btn-secondary" href="${ROUTES.adopt}"><i class="fa-solid fa-paw"></i> Back to Browse</a>
          </div>
        </div>
      </div>
    `;
  }

  function initApply() {
    const form = $('#applyForm');
    if (!form) return;

    const petId = qs('petId');
    const pet = petId ? getPet(petId) : null;
    const label = $('#applyPetName');
    if (label) label.textContent = pet ? pet.name : 'Selected Pet';

    const auth = getAuth();
    if (auth?.role === 'user') {
      const u = read(LS.USERS, []).find(x => x.id === auth.id);
      if (u) {
        form.fullName.value = u.name || '';
        form.email.value = u.email || '';
        form.phone.value = u.phone || '';
        form.city.value = u.city || '';
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;

      if (!pet) {
        showModal('Choose a pet', 'Please select a pet from the Adopt page before applying.');
        return;
      }

      const a = getAuth();
      if (!a || a.role !== 'user') {
        showModal('Login required', 'Please login as a User to submit an adoption application.');
        setTimeout(() => (location.href = `${ROUTES.login}?next=${encodeURIComponent(`${ROUTES.apply}?petId=${pet.id}`)}`), 650);
        return;
      }

      const apps = read(LS.APPS, []);
      apps.push({
        id: uid('app'),
        petId: pet.id,
        petName: pet.name,
        shelterId: pet.shelterId,
        userId: a.id,
        status: 'pending',
        createdAt: isoNow(),
        applicant: {
          fullName: form.fullName.value.trim(),
          email: form.email.value.trim(),
          phone: form.phone.value.trim(),
          city: form.city.value.trim(),
          address: form.address.value.trim(),
          housing: form.housing.value,
          experience: form.experience.value,
          message: form.message.value.trim()
        }
      });

      write(LS.APPS, apps);
      showModal('Application submitted', 'Your application has been sent to the shelter. Track status in your dashboard.');
      form.reset();
      setTimeout(() => (location.href = ROUTES.dashboard), 850);
    });
  }

  function initLogin() {
    const form = $('#loginForm');
    const registerForm = $('#registerUserForm');
    if (!form && !registerForm) return;

    const loginView = $('#loginView');
    const registerView = $('#registerView');
    const tabLogin = $('#tabLoginBtn');
    const tabRegister = $('#tabRegisterBtn');

    if (tabLogin && tabRegister) {
      const showLogin = () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginView.classList.add('active');
        registerView.classList.remove('active');
      };

      const showRegister = () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerView.classList.add('active');
        loginView.classList.remove('active');
      };

      tabLogin.addEventListener('click', showLogin);
      tabRegister.addEventListener('click', showRegister);

      // Check initial hash
      if (location.hash === '#register') {
        showRegister();
      }
    }

    const next = qs('next');

    $('#demoUser')?.addEventListener('click', () => {
      form.email.value = 'aarav@petportal-mail.com';
      form.password.value = 'User@1234';
      showModal('Demo User', 'Credentials auto-filled!');
    });

    $('#demoAdmin')?.addEventListener('click', () => {
      form.email.value = 'admin@petportal.org';
      form.password.value = 'Admin@123';
      showModal('Demo Admin', 'Credentials auto-filled!');
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;

      const email = form.email.value.trim();
      const password = form.password.value;
      const acc = findAccountByEmail(email);

      if (!acc) {
        showModal('Login failed', 'Account not found. Please register or check your email.');
        return;
      }

      if (acc.blocked) {
        showModal('Access blocked', 'This account is blocked. Please contact support.');
        return;
      }

      if (String(acc.password) !== String(password)) {
        showModal('Login failed', 'Incorrect password. Please try again.');
        return;
      }

      if (acc.accountType === 'shelter' && !acc.approved) {
        showModal('Shelter pending', 'Your shelter registration is pending admin approval.');
        return;
      }

      const role = acc.accountType;
      setAuth({ id: acc.id, role, name: acc.name, email: acc.email });

      showModal('Welcome', `Logged in as ${role}. Redirecting...`);

      const target = next ? decodeURIComponent(next) : ROUTES.dashboard;
      setTimeout(() => (location.href = target), 650);
    });

    registerForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(registerForm)) return;

      const email = registerForm.email.value.trim().toLowerCase();
      if (findAccountByEmail(email)) {
        showModal('Email in use', 'An account with this email already exists. Please login instead.');
        return;
      }

      const users = read(LS.USERS, []);
      const u = {
        id: uid('user'),
        role: 'user',
        name: registerForm.name.value.trim(),
        email,
        phone: registerForm.phone.value.trim(),
        city: registerForm.city.value.trim(),
        password: registerForm.password.value,
        blocked: false,
        createdAt: isoNow()
      };

      users.push(u);
      write(LS.USERS, users);
      setAuth({ id: u.id, role: 'user', name: u.name, email: u.email });

      showModal('Registration complete', 'Your user account is ready. Welcome to PetAdopt!');
      registerForm.reset();
      setTimeout(() => (location.href = ROUTES.dashboard), 850);
    });
  }

  function initRegister() {
    const userForm = $('#registerUserForm');
    const shelterForm = $('#registerShelterForm');
    if (!userForm && !shelterForm) return;

    const tabUser = $('#tabUser');
    const tabShelter = $('#tabShelter');

    const userArea = $('#registerUserArea');
    const shelterArea = $('#registerShelterArea');

    function show(which) {
      tabUser?.classList.toggle('active', which === 'user');
      tabShelter?.classList.toggle('active', which === 'shelter');
      if (userArea) userArea.style.display = which === 'user' ? '' : 'none';
      if (shelterArea) shelterArea.style.display = which === 'shelter' ? '' : 'none';
    }

    tabUser?.addEventListener('click', () => show('user'));
    tabShelter?.addEventListener('click', () => show('shelter'));
    show('user');

    userForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(userForm)) return;

      const email = userForm.email.value.trim().toLowerCase();
      if (findAccountByEmail(email)) {
        showModal('Email in use', 'An account with this email already exists. Please login instead.');
        return;
      }

      const users = read(LS.USERS, []);
      const u = {
        id: uid('user'),
        role: 'user',
        name: userForm.name.value.trim(),
        email,
        phone: userForm.phone.value.trim(),
        city: userForm.city.value.trim(),
        password: userForm.password.value,
        blocked: false,
        createdAt: isoNow()
      };

      users.push(u);
      write(LS.USERS, users);
      setAuth({ id: u.id, role: 'user', name: u.name, email: u.email });

      showModal('Registration complete', 'Your user account is ready. Browse pets and apply with confidence.');
      userForm.reset();
      setTimeout(() => (location.href = ROUTES.dashboard), 850);
    });

    shelterForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(shelterForm)) return;

      const email = shelterForm.email.value.trim().toLowerCase();
      if (findAccountByEmail(email)) {
        showModal('Email in use', 'An account with this email already exists. Please login instead.');
        return;
      }

      const shelters = read(LS.SHELTERS, []);
      shelters.push({
        id: uid('shelter'),
        name: shelterForm.name.value.trim(),
        email,
        phone: shelterForm.phone.value.trim(),
        city: shelterForm.city.value.trim(),
        password: shelterForm.password.value,
        approved: false,
        blocked: false,
        createdAt: isoNow()
      });

      write(LS.SHELTERS, shelters);
      showModal('Shelter submitted', 'Shelter registration is pending admin approval. You can login once approved.');
      shelterForm.reset();
      setTimeout(() => (location.href = ROUTES.login), 900);
    });
  }

  function initDashboard() {
    const host = $('#dashboardRoot');
    if (!host) return;

    const auth = getAuth();
    if (!auth) {
      host.innerHTML = `
        <div class="card card-pad" style="text-align:center;">
          <h2 style="margin:0;font-family:var(--font-display);font-weight:1000;">Login required</h2>
          <p style="margin:10px 0 0;color:var(--muted);font-weight:750;">Please login to view your dashboard.</p>
          <div style="margin-top:14px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
            <a class="btn btn-primary" href="${ROUTES.login}"><i class="fa-solid fa-right-to-bracket"></i> Login</a>
            <a class="btn btn-secondary" href="${ROUTES.register}"><i class="fa-solid fa-user-plus"></i> Register</a>
          </div>
        </div>
      `;
      return;
    }

    if (auth.role === 'shelter') { location.href = ROUTES.shelter; return; }
    if (auth.role === 'admin') { location.href = ROUTES.admin; return; }

    const apps = read(LS.APPS, []).filter(a => a.userId === auth.id);
    const shelters = read(LS.SHELTERS, []);

    const counts = {
      total: apps.length,
      pending: apps.filter(a => a.status === 'pending').length,
      approved: apps.filter(a => a.status === 'approved').length,
      rejected: apps.filter(a => a.status === 'rejected').length
    };

    host.innerHTML = `
      <div class="hero">
        <div class="hero-inner">
          <div>
            <span class="badge"><i class="fa-solid fa-user"></i> User Dashboard</span>
            <h1 style="margin-top:12px;">Welcome, ${escapeHtml(auth.name || 'User')}</h1>
            <p>Track adoption applications, view history, and discover pets that match your home.</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="${ROUTES.adopt}"><i class="fa-solid fa-paw"></i> Browse Pets</a>
              <a class="btn btn-secondary" href="${ROUTES.contact}"><i class="fa-solid fa-headset"></i> Support</a>
            </div>
          </div>
          <div class="hero-stats">
            <div class="stat-card"><strong>${counts.total}</strong><span>Total applications</span></div>
            <div class="stat-card"><strong>${counts.pending}</strong><span>Pending</span></div>
            <div class="stat-card"><strong>${counts.approved}</strong><span>Approved</span></div>
            <div class="stat-card"><strong>${counts.rejected}</strong><span>Rejected</span></div>
          </div>
        </div>
      </div>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Application Status</h2>
          <p class="section-subtitle">Shelters review applications with care. You’ll see updates here.</p>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Pet</th>
                <th>Shelter</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${apps.length ? apps.slice().reverse().map(a => {
      const s = shelters.find(x => x.id === a.shelterId);
      return `
                  <tr>
                    <td>${escapeHtml(a.id)}</td>
                    <td>${escapeHtml(a.petName)}</td>
                    <td>${escapeHtml(s?.name || 'Shelter')}</td>
                    <td>${escapeHtml(new Date(a.createdAt).toLocaleString())}</td>
                    <td><span class="status ${escapeHtml(a.status)}"><i class="fa-solid fa-circle"></i> ${escapeHtml(a.status)}</span></td>
                    <td><a class="btn btn-secondary" href="${ROUTES.pet}?id=${encodeURIComponent(a.petId)}"><i class="fa-solid fa-circle-info"></i> View Pet</a></td>
                  </tr>
                `;
    }).join('') : `
                <tr><td colspan="6" style="color:var(--muted);font-weight:850;">No applications yet. Browse pets and apply when you’re ready.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Adoption Responsibility</h2>
          <p class="section-subtitle">A successful adoption is a commitment. Please read before applying.</p>
        </div>
        <div class="grid grid-3">
          <div class="card card-pad">
            <span class="badge"><i class="fa-solid fa-house"></i> Home readiness</span>
            <p style="margin:10px 0 0;color:var(--muted);font-weight:750;">Confirm housing rules, daily schedule, and space match your pet’s needs.</p>
          </div>
          <div class="card card-pad">
            <span class="badge"><i class="fa-solid fa-stethoscope"></i> Veterinary care</span>
            <p style="margin:10px 0 0;color:var(--muted);font-weight:750;">Plan for checkups, vaccinations, grooming, and emergency savings.</p>
          </div>
          <div class="card card-pad">
            <span class="badge"><i class="fa-solid fa-hand-holding-heart"></i> Long-term support</span>
            <p style="margin:10px 0 0;color:var(--muted);font-weight:750;">Training and patience help pets settle. Shelters provide transition guidance.</p>
          </div>
        </div>
      </section>
    `;
  }

  function initShelterDashboard() {
    const root = $('#shelterRoot');
    if (!root) return;

    const auth = requireAuth(['shelter']);
    if (!auth) return;

    const shelters = read(LS.SHELTERS, []);
    const me = shelters.find(s => s.id === auth.id);
    if (!me) {
      showModal('Shelter missing', 'Your shelter account could not be found.');
      return;
    }

    const petsAll = read(LS.PETS, []);
    const appsAll = read(LS.APPS, []);
    const myPets = petsAll.filter(p => p.shelterId === me.id);
    const myApps = appsAll.filter(a => a.shelterId === me.id);

    root.innerHTML = `
      <div class="hero">
        <div class="hero-inner">
          <div>
            <span class="badge"><i class="fa-solid fa-building"></i> Shelter Panel</span>
            <h1 style="margin-top:12px;">${escapeHtml(me.name)}</h1>
            <p>Manage pet profiles and review applications. Keep details accurate to protect animals and adopters.</p>
            <div class="hero-actions">
              <button class="btn btn-primary" type="button" id="addPetBtn"><i class="fa-solid fa-plus"></i> Add Pet</button>
              <a class="btn btn-secondary" href="${ROUTES.adopt}"><i class="fa-solid fa-paw"></i> View Public Listing</a>
            </div>
          </div>
          <div class="hero-stats">
            <div class="stat-card"><strong>${myPets.length}</strong><span>Listed pets</span></div>
            <div class="stat-card"><strong>${myApps.filter(a => a.status === 'pending').length}</strong><span>Pending apps</span></div>
            <div class="stat-card"><strong>${myApps.filter(a => a.status === 'approved').length}</strong><span>Approved</span></div>
            <div class="stat-card"><strong>${myApps.filter(a => a.status === 'rejected').length}</strong><span>Rejected</span></div>
          </div>
        </div>
      </div>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Pet Management</h2>
          <p class="section-subtitle">Click a pet to edit or remove. Add two clear image URLs for best results.</p>
        </div>

        <div class="grid grid-2">
          <div class="card card-pad">
            <h3 style="margin:0 0 10px;font-family:var(--font-display);font-weight:1000;">Add / Edit Pet</h3>
            <form class="form" id="petForm">
              <input type="hidden" name="petId" />
              <div class="grid grid-2">
                <div class="field"><label>Name *</label><input name="name" required placeholder="Bella" /></div>
                <div class="field"><label>Species *</label>
                  <select name="species" required><option value="">Select</option><option>Dog</option><option>Cat</option></select>
                </div>
                <div class="field"><label>Breed *</label><input name="breed" required placeholder="Indie Mix" /></div>
                <div class="field"><label>Gender *</label>
                  <select name="gender" required><option value="">Select</option><option>Male</option><option>Female</option></select>
                </div>
                <div class="field"><label>Age (months) *</label><input name="ageMonths" required type="number" min="1" max="240" placeholder="18" /></div>
                <div class="field"><label>Size *</label>
                  <select name="size" required><option value="">Select</option><option>Small</option><option>Medium</option><option>Large</option></select>
                </div>
                <div class="field"><label>Energy *</label>
                  <select name="energy" required><option value="">Select</option><option>Calm</option><option>Balanced</option><option>Playful</option><option>High</option><option>Gentle</option><option>Curious</option></select>
                </div>
                <div class="field"><label>Location *</label><input name="location" required value="${escapeHtml(me.city || '')}" /></div>
              </div>

              <div class="grid grid-2">
                <div class="field"><label>Vaccinated *</label><select name="vaccinated" required><option value="true">Yes</option><option value="false">No</option></select></div>
                <div class="field"><label>Neutered/Spayed *</label><select name="neutered" required><option value="true">Yes</option><option value="false">No</option></select></div>
              </div>

              <div class="grid grid-2">
                <div class="field"><label>Good with kids *</label><select name="goodWithKids" required><option value="true">Yes</option><option value="false">No</option></select></div>
                <div class="field"><label>Good with pets *</label><select name="goodWithPets" required><option value="true">Yes</option><option value="false">No</option></select></div>
              </div>

              <div class="field"><label>Story *</label><textarea name="story" required placeholder="Background and temperament..."></textarea></div>
              <div class="field"><label>Traits (comma separated) *</label><input name="traits" required placeholder="Litter trained, Loves toys, Gentle" /></div>
              <div class="field"><label>Image URLs (2, comma separated) *</label><input name="images" required placeholder="https://..., https://..." /><p class="helper">Tip: Unsplash URLs work best.</p></div>

              <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;">
                <button class="btn btn-secondary" type="button" id="clearPetForm"><i class="fa-solid fa-broom"></i> Clear</button>
                <button class="btn btn-primary" type="submit"><i class="fa-solid fa-save"></i> Save Pet</button>
              </div>
            </form>
          </div>

          <div class="card card-pad">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
              <h3 style="margin:0;font-family:var(--font-display);font-weight:1000;">Your Pets</h3>
              <span class="badge"><i class="fa-solid fa-list"></i> ${myPets.length} total</span>
            </div>
            <p style="margin:10px 0 0;color:var(--muted);font-weight:750;">Click a pet to load it into the editor. Use remove carefully.</p>
            <div class="pet-grid" id="shelterPetGrid" style="margin-top:14px;">
              ${myPets.length ? myPets.map(p => petCard(p)).join('') : `
                <div class="card card-pad" style="grid-column:1/-1;text-align:center;box-shadow:none;">
                  <h4 style="margin:0;font-family:var(--font-display);font-weight:1000;">No pets listed yet</h4>
                  <p style="margin:8px 0 0;color:var(--muted);font-weight:750;">Add your first pet profile to start receiving applications.</p>
                </div>
              `}
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Applications</h2>
          <p class="section-subtitle">Approve or reject applications with clear documentation.</p>
        </div>

        <div class="table-wrap">
          <table id="shelterAppsTable">
            <thead>
              <tr>
                <th>Application</th>
                <th>Pet</th>
                <th>Applicant</th>
                <th>City</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${myApps.length ? myApps.slice().reverse().map(a => `
                <tr>
                  <td>${escapeHtml(a.id)}</td>
                  <td>${escapeHtml(a.petName)}</td>
                  <td>${escapeHtml(a.applicant.fullName)}</td>
                  <td>${escapeHtml(a.applicant.city)}</td>
                  <td>${escapeHtml(new Date(a.createdAt).toLocaleString())}</td>
                  <td><span class="status ${escapeHtml(a.status)}"><i class="fa-solid fa-circle"></i> ${escapeHtml(a.status)}</span></td>
                  <td style="display:flex;gap:10px;flex-wrap:wrap;">
                    <button class="btn btn-secondary" type="button" data-app-view="${escapeHtml(a.id)}"><i class="fa-solid fa-user"></i> View</button>
                    <button class="btn btn-primary" type="button" data-app-approve="${escapeHtml(a.id)}"><i class="fa-solid fa-check"></i> Approve</button>
                    <button class="btn btn-danger" type="button" data-app-reject="${escapeHtml(a.id)}"><i class="fa-solid fa-xmark"></i> Reject</button>
                  </td>
                </tr>
              `).join('') : `<tr><td colspan="7" style="color:var(--muted);font-weight:850;">No applications yet.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;

    const petForm = $('#petForm');
    const clearBtn = $('#clearPetForm');
    const grid = $('#shelterPetGrid');

    const resetPetForm = () => {
      petForm.reset();
      petForm.petId.value = '';
      petForm.location.value = me.city || '';
    };

    clearBtn?.addEventListener('click', resetPetForm);

    $('#addPetBtn')?.addEventListener('click', () => {
      resetPetForm();
      showModal('Add pet', 'Fill the form and click Save Pet to publish a new profile.');
      petForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    grid?.addEventListener('click', (e) => {
      const card = e.target.closest('.pet-card');
      if (!card) return;
      if (e.target.closest('a')) return;

      const id = card.dataset.petId;
      const p = read(LS.PETS, []).find(x => x.id === id);
      if (!p) return;

      petForm.petId.value = p.id;
      petForm.name.value = p.name;
      petForm.species.value = p.species;
      petForm.breed.value = p.breed;
      petForm.gender.value = p.gender;
      petForm.ageMonths.value = String(p.ageMonths);
      petForm.size.value = p.size;
      petForm.energy.value = p.energy;
      petForm.location.value = p.location;
      petForm.vaccinated.value = String(Boolean(p.vaccinated));
      petForm.neutered.value = String(Boolean(p.neutered));
      petForm.goodWithKids.value = String(Boolean(p.goodWithKids));
      petForm.goodWithPets.value = String(Boolean(p.goodWithPets));
      petForm.story.value = p.story;
      petForm.traits.value = (p.traits || []).join(', ');
      petForm.images.value = (p.images || []).join(', ');

      showModal('Edit pet loaded', `Editing: ${p.name}. Update fields and click Save Pet.`);
      petForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    petForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(petForm)) return;

      const pets = read(LS.PETS, []);
      const petId = petForm.petId.value.trim();
      const images = petForm.images.value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 2).map(normalizeImageUrl);

      const payload = {
        id: petId || uid('pet'),
        shelterId: me.id,
        status: 'available',
        name: petForm.name.value.trim(),
        species: petForm.species.value,
        breed: petForm.breed.value.trim(),
        gender: petForm.gender.value,
        ageMonths: Number(petForm.ageMonths.value),
        size: petForm.size.value,
        location: petForm.location.value.trim(),
        color: '',
        vaccinated: petForm.vaccinated.value === 'true',
        neutered: petForm.neutered.value === 'true',
        energy: petForm.energy.value,
        goodWithKids: petForm.goodWithKids.value === 'true',
        goodWithPets: petForm.goodWithPets.value === 'true',
        story: petForm.story.value.trim(),
        traits: petForm.traits.value.split(',').map(x => x.trim()).filter(Boolean),
        images,
        createdAt: petId ? (pets.find(x => x.id === petId)?.createdAt || isoNow()) : isoNow()
      };

      const idx = pets.findIndex(x => x.id === payload.id);
      if (idx >= 0) pets[idx] = payload;
      else pets.push(payload);

      write(LS.PETS, pets);
      showModal('Saved', 'Pet profile saved.');
      setTimeout(() => location.reload(), 450);
    });

    root.addEventListener('click', (e) => {
      const view = e.target.closest('[data-app-view]');
      const approve = e.target.closest('[data-app-approve]');
      const reject = e.target.closest('[data-app-reject]');

      if (view) {
        const id = view.getAttribute('data-app-view');
        const apps = read(LS.APPS, []);
        const a = apps.find(x => x.id === id);
        if (!a) return;
        showModal('Applicant details', `${a.applicant.fullName} • ${a.applicant.email} • ${a.applicant.phone}\n\nHousing: ${a.applicant.housing}\nExperience: ${a.applicant.experience}\n\nMessage: ${a.applicant.message}`);
        return;
      }

      if (approve || reject) {
        const id = approve ? approve.getAttribute('data-app-approve') : reject.getAttribute('data-app-reject');
        const apps = read(LS.APPS, []);
        const a = apps.find(x => x.id === id);
        if (!a) return;

        if (approve) {
          a.status = 'approved';
          a.updatedAt = isoNow();

          const pets = read(LS.PETS, []);
          const p = pets.find(x => x.id === a.petId);
          if (p) p.status = 'adopted';
          write(LS.PETS, pets);

          showModal('Approved', 'Application approved. The pet is now marked as adopted.');
        } else {
          a.status = 'rejected';
          a.updatedAt = isoNow();
          showModal('Rejected', 'Application rejected.');
        }

        write(LS.APPS, apps);
        setTimeout(() => location.reload(), 500);
      }
    });
  }

  function initAdmin() {
    const root = $('#adminRoot');
    if (!root) return;

    const auth = requireAuth(['admin']);
    if (!auth) return;

    const users = read(LS.USERS, []);
    const shelters = read(LS.SHELTERS, []);
    const apps = read(LS.APPS, []);

    const pendingShelters = shelters.filter(s => !s.approved);

    root.innerHTML = `
      <div class="hero">
        <div class="hero-inner">
          <div>
            <span class="badge"><i class="fa-solid fa-shield"></i> Admin Control Panel</span>
            <h1 style="margin-top:12px;">Platform Oversight</h1>
            <p>Approve shelters, monitor adoptions, and block misuse. Actions are stored locally (demo mode).</p>
            <div class="hero-actions">
              <button class="btn btn-primary" type="button" id="approveAllShelters"><i class="fa-solid fa-check-double"></i> Approve Pending Shelters</button>
              <button class="btn btn-secondary" type="button" id="exportSnapshot"><i class="fa-solid fa-file-export"></i> Export Snapshot</button>
            </div>
          </div>
          <div class="hero-stats" id="adminStats">
            <div class="stat-card"><strong>${users.length}</strong><span>Users</span></div>
            <div class="stat-card"><strong>${shelters.length}</strong><span>Shelters</span></div>
            <div class="stat-card"><strong>${apps.length}</strong><span>Applications</span></div>
            <div class="stat-card"><strong>${pendingShelters.length}</strong><span>Pending shelters</span></div>
          </div>
        </div>
      </div>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Shelter Registrations</h2>
          <p class="section-subtitle">Approve shelters before they can login and publish pets. Block suspicious registrations when necessary.</p>
        </div>
        <div class="table-wrap">
          <table id="adminSheltersTable">
            <thead>
              <tr>
                <th>Shelter</th>
                <th>Email</th>
                <th>City</th>
                <th>Approved</th>
                <th>Blocked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${shelters.map(s => `
                <tr>
                  <td>${escapeHtml(s.name)}</td>
                  <td>${escapeHtml(s.email)}</td>
                  <td>${escapeHtml(s.city || '')}</td>
                  <td>${s.approved ? 'Yes' : 'No'}</td>
                  <td>${s.blocked ? 'Yes' : 'No'}</td>
                  <td style="display:flex;gap:10px;flex-wrap:wrap;">
                    <button class="btn btn-primary" type="button" data-approve-shelter="${escapeHtml(s.id)}"><i class="fa-solid fa-check"></i> Approve</button>
                    <button class="btn btn-secondary" type="button" data-toggle-block-shelter="${escapeHtml(s.id)}"><i class="fa-solid fa-ban"></i> Toggle Block</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">User Accounts</h2>
          <p class="section-subtitle">Block misuse or fake accounts. For demo, editing is limited to block/unblock.</p>
        </div>
        <div class="table-wrap">
          <table id="adminUsersTable">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>City</th>
                <th>Blocked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>${escapeHtml(u.name)}</td>
                  <td>${escapeHtml(u.email)}</td>
                  <td>${escapeHtml(u.city || '')}</td>
                  <td>${u.blocked ? 'Yes' : 'No'}</td>
                  <td>
                    <button class="btn btn-secondary" type="button" data-toggle-block-user="${escapeHtml(u.id)}"><i class="fa-solid fa-ban"></i> Toggle Block</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Adoption Monitoring</h2>
          <p class="section-subtitle">Monitor application flow and spot potential fraud patterns (demo data only).</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Pet</th>
                <th>User</th>
                <th>Shelter</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              ${apps.length ? apps.slice().reverse().map(a => {
      const u = users.find(x => x.id === a.userId);
      const s = shelters.find(x => x.id === a.shelterId);
      return `
                  <tr>
                    <td>${escapeHtml(a.id)}</td>
                    <td>${escapeHtml(a.petName)}</td>
                    <td>${escapeHtml(u?.name || 'User')}</td>
                    <td>${escapeHtml(s?.name || 'Shelter')}</td>
                    <td><span class="status ${escapeHtml(a.status)}"><i class="fa-solid fa-circle"></i> ${escapeHtml(a.status)}</span></td>
                    <td>${escapeHtml(new Date(a.createdAt).toLocaleString())}</td>
                  </tr>
                `;
    }).join('') : `<tr><td colspan="6" style="color:var(--muted);font-weight:850;">No applications recorded yet.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    `;

    $('#approveAllShelters')?.addEventListener('click', () => {
      const all = read(LS.SHELTERS, []);
      let changed = 0;
      all.forEach(s => {
        if (!s.approved) {
          s.approved = true;
          changed++;
        }
      });
      write(LS.SHELTERS, all);
      showModal('Shelters approved', `Approved ${changed} shelter(s).`);
      setTimeout(() => location.reload(), 650);
    });

    $('#exportSnapshot')?.addEventListener('click', () => {
      const snapshot = {
        exportedAt: isoNow(),
        users: read(LS.USERS, []),
        shelters: read(LS.SHELTERS, []),
        pets: read(LS.PETS, []),
        applications: read(LS.APPS, [])
      };

      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `pet-adoption-portal-snapshot-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);

      showModal('Export ready', 'Snapshot downloaded as a JSON file.');
    });

    root.addEventListener('click', (e) => {
      const approve = e.target.closest('[data-approve-shelter]');
      const toggleShelter = e.target.closest('[data-toggle-block-shelter]');
      const toggleUser = e.target.closest('[data-toggle-block-user]');

      if (approve) {
        const id = approve.getAttribute('data-approve-shelter');
        const all = read(LS.SHELTERS, []);
        const s = all.find(x => x.id === id);
        if (!s) return;
        s.approved = true;
        s.blocked = false;
        write(LS.SHELTERS, all);
        showModal('Shelter approved', 'The shelter can now login and manage animals.');
        setTimeout(() => location.reload(), 550);
      }

      if (toggleShelter) {
        const id = toggleShelter.getAttribute('data-toggle-block-shelter');
        const all = read(LS.SHELTERS, []);
        const s = all.find(x => x.id === id);
        if (!s) return;
        s.blocked = !s.blocked;
        if (s.blocked) s.approved = false;
        write(LS.SHELTERS, all);
        showModal('Shelter updated', s.blocked ? 'Shelter blocked and approval removed.' : 'Shelter unblocked.');
        setTimeout(() => location.reload(), 550);
      }

      if (toggleUser) {
        const id = toggleUser.getAttribute('data-toggle-block-user');
        const all = read(LS.USERS, []);
        const u = all.find(x => x.id === id);
        if (!u) return;
        u.blocked = !u.blocked;
        write(LS.USERS, all);
        showModal('User updated', u.blocked ? 'User blocked.' : 'User unblocked.');
        setTimeout(() => location.reload(), 550);
      }
    });
  }

  function initHome2() {
    // Initialize carousel
    const carousel = $('#featuredCarousel');
    const prevBtn = $('#carouselPrev');
    const nextBtn = $('#carouselNext');

    if (carousel && prevBtn && nextBtn) {
      // Reverse the list to show different pets/order than the main home page
      const pets = listPets({}).reverse().slice(0, 6);

      carousel.innerHTML = pets.map(pet => `
        <div class="carousel-item">
          <div class="pet-card">
            <div class="pet-media">
              <!-- Use 2nd image for variety if available -->
              <img src="${normalizeImageUrl(pet.images?.[1] || pet.images?.[0] || '')}" alt="${escapeHtml(pet.name)}" />
            </div>
            <div class="pet-body">
              <div class="pet-title">
                <h3>${escapeHtml(pet.name)}</h3>
                <span class="pill"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(pet.location)}</span>
              </div>
              <div class="pet-meta">
                <span><i class="fa-solid fa-paw"></i> ${escapeHtml(pet.species)}</span>
                <span><i class="fa-solid fa-cake-candles"></i> ${escapeHtml(ageLabel(pet.ageMonths))}</span>
              </div>
              <div class="pet-actions">
                <a class="btn btn-secondary" href="${ROUTES.pet}?id=${encodeURIComponent(pet.id)}"><i class="fa-solid fa-circle-info"></i> Details</a>
                <a class="btn btn-primary" href="${ROUTES.apply}?petId=${encodeURIComponent(pet.id)}"><i class="fa-solid fa-file-signature"></i> Apply</a>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      let currentIndex = 0;

      const getCarouselStats = () => {
        const item = carousel.querySelector('.carousel-item');
        if (!item) return { itemWidth: 316, maxIndex: 0 };
        const itemWidth = item.offsetWidth + 16;
        const containerWidth = carousel.parentElement.offsetWidth;
        const visibleItems = Math.floor(containerWidth / itemWidth) || 1;
        const maxIndex = Math.max(0, pets.length - visibleItems);
        return { itemWidth, maxIndex };
      };

      const updateCarousel = () => {
        const { itemWidth, maxIndex } = getCarouselStats();
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        carousel.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
      };

      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      });

      nextBtn.addEventListener('click', () => {
        const { maxIndex } = getCarouselStats();
        if (currentIndex < maxIndex) {
          currentIndex++;
          updateCarousel();
        }
      });

      window.addEventListener('resize', updateCarousel);
      setTimeout(updateCarousel, 100);

      updateCarousel();
    }

    // Initialize newsletter form
    const newsletterForm = $('#newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        if (validateEmail(email)) {
          showModal('Success!', 'Thank you for subscribing to our newsletter!');
          newsletterForm.reset();
        } else {
          showModal('Invalid Email', 'Please enter a valid email address.');
        }
      });
    }
  }

  function initContact() {
    const form = $('#contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;
      showModal('Message sent', 'Thanks for reaching out. Our support team will reply soon.');
      form.reset();
    });
  }

  /* -------------------- Global init -------------------- */

  function initButtonPulse() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      btn.style.transform = 'translateY(1px) scale(0.99)';
      setTimeout(() => (btn.style.transform = ''), 140);
    });
  }

  function initBackToTop() {
    let btn = $('.back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'back-to-top';
      btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
      btn.setAttribute('aria-label', 'Back to top');
      document.body.appendChild(btn);
    }

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) btn.classList.add('visible');
      else btn.classList.remove('visible');
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initThemeToggle() {
    const btn = $('#themeToggle');
    if (!btn) return;

    const saved = localStorage.getItem('pap_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('pap_theme', next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    const btn = $('#themeToggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
  }

  function initRoute() {
    initIndex();
    initHome2();
    initLogin();
    initRegister();
    initDashboard();
    initAdopt();
    initPetDetails();
    initApply();
    initShelterDashboard();
    initAdmin();
    initContact();
  }

  function boot() {
    ensureSeed();
    renderLayout();
    initRoute();
    initMediaFallbacks();
    initButtonPulse();
    initThemeToggle();
    initBackToTop();
    setupCustomSelects();
  }

  function setupCustomSelects() {
    const selects = document.querySelectorAll('.field select:not(.replaced)');

    selects.forEach(select => {
      // Create DOM structure
      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-container';

      const trigger = document.createElement('div');
      trigger.className = 'custom-select-trigger';
      // Set initial text
      const selectedOption = select.options[select.selectedIndex];
      trigger.textContent = selectedOption ? selectedOption.textContent : 'Select';

      const optionsList = document.createElement('div');
      optionsList.className = 'custom-select-options';

      // Populate options
      Array.from(select.options).forEach(opt => {
        const el = document.createElement('div');
        el.className = 'custom-select-option';
        if (opt.selected) el.classList.add('selected');
        el.textContent = opt.textContent;
        el.dataset.value = opt.value;

        el.addEventListener('click', (e) => {
          e.stopPropagation();

          // Update visual
          trigger.textContent = opt.textContent;
          wrapper.classList.remove('open');

          // Update styles
          wrapper.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
          el.classList.add('selected');

          // Update original select and trigger change
          if (select.value !== opt.value) {
            select.value = opt.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });

        optionsList.appendChild(el);
      });

      // Toggle logic
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.contains('open');

        // Close all others
        document.querySelectorAll('.custom-select-container.open').forEach(c => {
          c.classList.remove('open');
          c.classList.remove('open-up'); // Also remove open-up from others
        });

        if (!isOpen) {
          // Viewport collision detection
          const rect = wrapper.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          // If less than 250px space below, open upwards
          if (spaceBelow < 250) {
            wrapper.classList.add('open-up');
          } else {
            wrapper.classList.remove('open-up');
          }

          wrapper.classList.add('open');
        }
      });

      // Insert into DOM
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);
      select.classList.add('replaced');
      wrapper.appendChild(trigger);
      wrapper.appendChild(optionsList);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-select-container')) {
        document.querySelectorAll('.custom-select-container.open').forEach(c => {
          c.classList.remove('open');
          c.classList.remove('open-up'); // Also remove open-up when closing on outside click
        });
      }
    });
  }

  // Initialize Featured Companions Carousel (for home2.html)
  function initFeaturedCarousel() {
    const carouselTrack = $('#featuredCarousel');
    if (!carouselTrack) return;

    // Correctly fetch pets from local storage
    const pets = read(LS.PETS, []);

    // Define 4 featured pets with custom images
    const featuredPetIds = ['pet-101', 'pet-102', 'pet-103', 'pet-104'];
    const customImages = [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVYmvH2GzqRbPbcJ3tShBQCDGgQvZ700rA4w&s',
      'https://icdn.isrgrajan.com/in/2021/01/Guinea-Pigs-playing-pet-animals.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvmOOBSFn1Y9Z101MXACWdA8QABuaKbG-cew&s',
      'https://media.hswstatic.com/eyJidWNrZXQiOiJjb250ZW50Lmhzd3N0YXRpYy5jb20iLCJrZXkiOiJnaWZcL2dldHR5aW1hZ2VzLTE0MTc5NTY1MDMuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjo4Mjh9fX0='
    ];

    // Get the first 4 available pets and update their images
    const featured = pets
      .filter(p => p.status === 'available')
      .slice(0, 4)
      .map((pet, index) => {
        // Create a copy of the pet with custom image
        return {
          ...pet,
          images: [customImages[index] || pet.images[0]]
        };
      });

    if (featured.length === 0) {
      carouselTrack.innerHTML = `
        <div style="text-align:center;padding:40px;width:100%;">
          <p style="color:var(--muted);font-weight:700;">No pets available at the moment. Check back soon!</p>
        </div>
      `;
      return;
    }

    carouselTrack.innerHTML = featured.map(pet => petCard(pet)).join('');
  }

  // Initialize Back to Top Button (Global except Login/Register)
  function initBackToTop() {
    const file = currentFile();
    // Exclude login/register pages
    if (file === 'login.html' || file === 'register.html' || location.href.includes('login') || location.href.includes('register')) {
      return;
    }

    // Check if button already exists
    if (document.getElementById('backToTop')) return;

    // Create button
    const btn = document.createElement('button');
    btn.id = 'backToTop';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(btn);

    const toggleButton = () => {
      const scrollInput = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (scrollInput > 100) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', toggleButton, { passive: true });
    document.body.addEventListener('scroll', toggleButton, { passive: true });

    // Periodically check for scroll state (robustness)
    setInterval(toggleButton, 1000);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initial check
    toggleButton();
  }

  document.addEventListener('DOMContentLoaded', () => {
    boot();
    initFeaturedCarousel();
    initBackToTop();
  });

  // Minimal public API
  window.PetPortal = {
    showModal,
    getAuth: () => getAuth(),
    logout: () => logout(),
    resetPetData: () => resetPetData()
  };
})();
