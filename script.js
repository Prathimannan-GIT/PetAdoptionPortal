/*
 Pet Adoption Portal (HTML/CSS/JS only)
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
    register: 'register.html',
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
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7fbff"/><stop offset="0.55" stop-color="#f3fff6"/><stop offset="1" stop-color="#f7fbff"/></linearGradient><linearGradient id="a" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#22c55e" stop-opacity="0.85"/><stop offset="1" stop-color="#0ea5e9" stop-opacity="0.85"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><g opacity="0.18"><path d="M0 560 C 160 480, 360 640, 560 560 S 920 480, 1200 560" fill="none" stroke="url(#a)" stroke-width="14"/></g><g><text x="70" y="130" fill="#0b1b2c" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="900">Pet Adoption Portal</text><text x="70" y="180" fill="#245" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" opacity="0.75">Find Your Perfect Companion</text></g></svg>`;
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
      img.addEventListener('error', function() {
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
    field.insertAdjacentElement('afterend', p);
  }

  function validateForm(form) {
    clearErrors(form);
    let ok = true;

    $$('[required]', form).forEach(field => {
      const v = String(field.value || '').trim();
      if (!v) {
        ok = false;
        setError(field, 'This field is required.');
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
            'https://images.unsplash.com/photo-1558788353-f76d92427f16',
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
            'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
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
            'https://images.unsplash.com/photo-1543852786-1cf6624b9987',
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba'
          ],
          createdAt: isoNow()
        },
        {
          id: 'pet-105',
          name: 'Kiwi',
          species: 'Dog',
          breed: 'Border Collie',
          gender: 'Male',
          ageMonths: 14,
          size: 'Medium',
          color: 'Black',
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
            'https://images.unsplash.com/photo-1517849845537-4d257902454a',
            'https://images.unsplash.com/photo-1507146426996-ef05306b995a'
          ],
          createdAt: isoNow()
        }
      );
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

    const auth = getAuth();
    const path = currentFile();

    const nav = [
      { href: ROUTES.home, label: 'Home', icon: 'fa-house' },
      { href: ROUTES.home2, label: 'Home 2', icon: 'fa-star' },
      { href: ROUTES.adopt, label: 'Adopt', icon: 'fa-paw' },
      { href: ROUTES.services, label: 'Services', icon: 'fa-heart' },
      { href: ROUTES.blog, label: 'Blog', icon: 'fa-newspaper' },
      { href: ROUTES.about, label: 'About', icon: 'fa-info-circle' },
      { href: ROUTES.contact, label: 'Contact', icon: 'fa-envelope' }
    ];

    const isActive = (href) => path === href.toLowerCase();

    headerHost.innerHTML = `
      <header class="site-header">
        <div class="container">
          <div class="navbar">
            <a class="brand" href="${ROUTES.home}" aria-label="Pet Adoption Portal">
              <span class="brand-badge"><i class="fa-solid fa-paw"></i></span>
              <span>Pet Adoption Portal</span>
            </a>

            <nav class="nav-links" id="navLinks" aria-label="Primary">
              ${nav.map(l => {
                if (l.dropdown) {
                  return `
                    <div class="dropdown ${isActive(l.href) ? 'active' : ''}" data-dropdown>
                      <a href="${l.href}" class="dropdown-toggle ${isActive(l.href) ? 'active' : ''}">
                        <i class="fa-solid ${l.icon}"></i> ${l.label}
                      </a>
                      <div class="dropdown-menu">
                        ${l.dropdown.map(item => `
                          <a href="${item.href}" class="${isActive(item.href) ? 'active' : ''}">
                            <i class="fa-solid ${item.icon}"></i> ${item.label}
                          </a>
                        `).join('')}
                      </div>
                    </div>
                  `;
                } else {
                  return `
                    <a href="${l.href}" class="${isActive(l.href) ? 'active' : ''}">
                      <i class="fa-solid ${l.icon}"></i> ${l.label}
                    </a>
                  `;
                }
              }).join('')}
              ${auth ? `
                <a href="${ROUTES.dashboard}" class="${isActive(ROUTES.dashboard) ? 'active' : ''}">
                  <i class="fa-solid fa-gauge"></i> Dashboard
                </a>
              ` : ''}
            </nav>

            <div class="nav-actions">
              ${auth ? `
                <span class="badge" title="Logged in">
                  <i class="fa-solid fa-user"></i>
                  ${escapeHtml(auth.name || 'Account')}
                  <span style="opacity:0.7">(${escapeHtml(auth.role)})</span>
                </span>
                <a href="${ROUTES.dashboard}" class="btn btn-primary">Dashboard</a>
                <button id="logoutBtn" class="btn btn-secondary">Logout</button>
              ` : `
                <a href="${ROUTES.login}" class="btn btn-secondary">
                  <i class="fa-solid fa-right-to-bracket"></i> Login
                </a>
                <a href="${ROUTES.register}" class="btn btn-primary">
                  <i class="fa-solid fa-user-plus"></i> Register
                </a>
              `}
              <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme" type="button">
                <i class="fa-solid fa-moon" id="themeIcon"></i>
              </button>
              <button class="mobile-toggle" id="mobileToggle" aria-label="Open menu" type="button">
                <span></span><span></span><span></span>
              </button>
            </div>
          </div>
        </div>
      </header>
    `;

    footerHost.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="card card-pad">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <span class="brand-badge" style="width:32px;height:32px;font-size:0.9rem;"><i class="fa-solid fa-paw"></i></span>
                <h3 class="footer-title" style="margin:0;">Pet Adoption Portal</h3>
              </div>
              <p style="margin:0;color:var(--muted);font-weight:750;">A trustworthy adoption platform connecting families with verified shelters. Transparent applications and responsible adoption guidance.</p>
              <div style="margin-top:12px" class="social" aria-label="Social links">
                <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa-brands fa-facebook"></i></a>
                <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter"><i class="fa-brands fa-x-twitter"></i></a>
                <a href="https://wa.me/15559012277" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
              </div>
            </div>

            <div class="card card-pad">
              <h3 class="footer-title">Quick Links</h3>
              <ul class="footer-list">
                <li><a href="${ROUTES.home}">Home</a></li>
                <li><a href="${ROUTES.adopt}">Browse Pets</a></li>
                <li><a href="${ROUTES.dashboard}">Dashboard</a></li>
                <li><a href="${ROUTES.about}">About</a></li>
              </ul>
            </div>

            <div class="card card-pad">
              <h3 class="footer-title">Legal</h3>
              <ul class="footer-list">
                <li><a href="${ROUTES.privacy}">Privacy Policy</a></li>
                <li><a href="${ROUTES.terms}">Terms & Conditions</a></li>
                <li><a href="${ROUTES.contact}">Report Misuse</a></li>
              </ul>
            </div>

            <div class="card card-pad">
              <h3 class="footer-title">Contact</h3>
              <ul class="footer-list">
                <li><span><i class="fa-solid fa-envelope"></i> support@petportal.org</span></li>
                <li><span><i class="fa-solid fa-phone"></i> +1 (555) 901-2277</span></li>
                <li><span><i class="fa-solid fa-location-dot"></i> Community-first adoption network</span></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} Pet Adoption Portal. All rights reserved.</span>
            <span>Adopt responsibly • Verify home readiness • Respect shelter policies</span>
          </div>
        </div>
      </footer>
    `;

    const navLinks = $('#navLinks');
    const toggle = $('#mobileToggle');

    if (toggle && navLinks) {
      toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
      $$('a', navLinks).forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
      document.addEventListener('click', (e) => {
        if (!navLinks.classList.contains('open')) return;
        if (e.target.closest('#navLinks') || e.target.closest('#mobileToggle')) return;
        navLinks.classList.remove('open');
      });
    }

    // Dropdown functionality
    const dropdowns = $$('[data-dropdown]');
    dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector('.dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');
      
      if (toggle && menu) {
        // Click to toggle
        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Close other dropdowns
          dropdowns.forEach(other => {
            if (other !== dropdown) other.classList.remove('open');
          });
          
          dropdown.classList.toggle('open');
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
          if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
          }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            dropdown.classList.remove('open');
          }
        });
      }
    });

    const logoutBtn = $('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        logout();
        showModal('Logged out', 'You have been safely logged out.');
        setTimeout(() => (location.href = ROUTES.home), 650);
      });
    }

    // Theme toggle functionality
    const themeToggle = $('#themeToggle');
    const themeIcon = $('#themeIcon');
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('pap_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    if (themeToggle && themeIcon) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('pap_theme', newTheme);
        updateThemeIcon(newTheme);
      });
    }
    
    function updateThemeIcon(theme) {
      if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
    }
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
      featured.innerHTML = listPets({}).slice(0, 3).map(petCard).join('');
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
    if (!form) return;

    const next = qs('next');

    $('#demoUser')?.addEventListener('click', () => showModal('Demo User', 'Email: aarav@petportal-mail.com\nPassword: User@1234'));
    $('#demoShelter')?.addEventListener('click', () => showModal('Demo Shelter', 'Email: greenpaws@shelter.org\nPassword: Shelter@123'));
    $('#demoAdmin')?.addEventListener('click', () => showModal('Demo Admin', 'Email: admin@petportal.org\nPassword: Admin@123'));

    form.addEventListener('submit', (e) => {
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
  }

  function initRegister() {
    const userForm = $('#registerUserForm');
    const shelterForm = $('#registerShelterForm');
    if (!userForm && !shelterForm) return;

    const tabUser = $('#tabUser');
    const tabShelter = $('#tabShelter');

    function show(which) {
      tabUser?.classList.toggle('active', which === 'user');
      tabShelter?.classList.toggle('active', which === 'shelter');
      if (userForm) userForm.style.display = which === 'user' ? '' : 'none';
      if (shelterForm) shelterForm.style.display = which === 'shelter' ? '' : 'none';
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
            <div class="stat-card"><strong>${myApps.filter(a=>a.status==='pending').length}</strong><span>Pending apps</span></div>
            <div class="stat-card"><strong>${myApps.filter(a=>a.status==='approved').length}</strong><span>Approved</span></div>
            <div class="stat-card"><strong>${myApps.filter(a=>a.status==='rejected').length}</strong><span>Rejected</span></div>
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
      const pets = listPets({}).slice(0, 6);
      carousel.innerHTML = pets.map(pet => `
        <div class="carousel-item">
          <div class="pet-card">
            <div class="pet-media">
              <img src="${normalizeImageUrl(pet.images?.[0] || '')}" alt="${escapeHtml(pet.name)}" />
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
      const itemWidth = 316; // 300px + 16px gap
      const visibleItems = Math.floor(carousel.parentElement.offsetWidth / itemWidth);
      const maxIndex = Math.max(0, pets.length - visibleItems);
      
      const updateCarousel = () => {
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
        if (currentIndex < maxIndex) {
          currentIndex++;
          updateCarousel();
        }
      });
      
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
    // Create back to top button
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(backToTop);

    // Show/hide button based on scroll position
    const toggleBackToTop = () => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    };

    // Scroll to top when clicked
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Listen for scroll events
    window.addEventListener('scroll', toggleBackToTop);
    
    // Initial check
    toggleBackToTop();
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
  }

  document.addEventListener('DOMContentLoaded', boot);

  // Theme toggle functionality
  function initThemeToggle() {
    const themeToggle = $('#themeToggle');
    if (!themeToggle) return;

    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    const themeToggle = $('#themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
  }

  // Back to top button functionality
  function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top hidden';
    backToTopBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.remove('hidden');
      } else {
        backToTopBtn.classList.add('hidden');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Minimal public API
  window.PetPortal = {
    showModal,
    getAuth: () => getAuth(),
    logout: () => logout(),
    resetPetData: () => resetPetData()
  };
})();
