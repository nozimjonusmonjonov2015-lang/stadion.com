const STORAGE_KEYS = {
  theme: 'stadionly-theme',
  favorites: 'stadionly-favorites',
  stadiums: 'stadionly-stadiums',
  locks: 'stadionly-locks',
  requests: 'stadionly-requests',
  recurringBookings: 'stadionly-recurring-bookings',
};

const defaultStadiums = [
  {
    id: 'st-1',
    name: 'Emerald Arena',
    type: 'Ochiq',
    district: 'Yakkabog\'',
    price: 120000,
    discount: 15,
    rating: 4.9,
    reviews: 128,
    status: true,
    phone: '+998 90 123 45 67',
    coords: [41.3111, 69.2797],
    slots: ['08:00-09:30', '09:45-11:15', '18:00-19:30'],
  },
  {
    id: 'st-2',
    name: 'Sky Pitch',
    type: 'Yopiq',
    district: 'Olmazor',
    price: 180000,
    discount: 10,
    rating: 4.7,
    reviews: 96,
    status: false,
    phone: '+998 91 456 78 90',
    coords: [41.3274, 69.2351],
    slots: ['10:00-11:30', '12:00-13:30'],
  },
  {
    id: 'st-3',
    name: 'Green Valley',
    type: 'Ochiq',
    district: 'Mirobod',
    price: 210000,
    discount: 20,
    rating: 4.8,
    reviews: 143,
    status: true,
    phone: '+998 93 222 33 44',
    coords: [41.3389, 69.2955],
    slots: ['07:30-09:00', '16:00-17:30', '19:00-20:30'],
  },
  {
    id: 'st-4',
    name: 'Solar Dome',
    type: 'Yopiq',
    district: 'Chilonzor',
    price: 260000,
    discount: 12,
    rating: 4.9,
    reviews: 188,
    status: true,
    phone: '+998 94 555 66 77',
    coords: [41.2865, 69.1961],
    slots: ['08:30-10:00', '17:30-19:00', '19:15-20:45'],
  },
  {
    id: 'st-5',
    name: 'Tashkent FC Center',
    type: 'Ochiq',
    district: 'Uchtepa',
    price: 150000,
    discount: 18,
    rating: 4.6,
    reviews: 76,
    status: true,
    phone: '+998 97 101 22 33',
    coords: [41.3567, 69.2809],
    slots: ['09:00-10:30', '15:30-17:00', '18:30-20:00'],
  },
  {
    id: 'st-6',
    name: 'Nord Field',
    type: 'Yopiq',
    district: 'Yunusobod',
    price: 320000,
    discount: 25,
    rating: 5.0,
    reviews: 204,
    status: true,
    phone: '+998 98 202 77 88',
    coords: [41.3541, 69.1928],
    slots: ['08:00-09:45', '11:00-12:45', '17:45-19:30'],
  },
];

const defaultNews = [
  {
    title: 'Toshkentda mavsumiy chempionat uchun 12 ta yangi stadion ro\'yxatdan o\'tkazildi.',
    category: 'Turnir',
    summary: 'Yangi maydonlar, 5x5 va 7x7 formatlaridan foydalangan holda, haftasiga 3 dan ortiq musobaqalar tashkil etiladi.',
  },
  {
    title: 'Ochiq maydonlar uchun haftalik chegirma 20% gacha oshdi.',
    category: 'Promokod',
    summary: 'Bu hafta faqat ochiq maydonlar uchun maxsus chegirma mavjud. Qolgan slotlar tez ishlaydi.',
  },
  {
    title: 'Jamoa qidiruv bo\'limi yangilandi: 42 ta taqdimot kutilmoqda.',
    category: 'Jamoadagi talab',
    summary: 'Yangi talablarga ko\'ra, 2 yoki 3 nafar himoyachi va hujumchi qidirilmoqda.',
  },
];

const defaultRequests = [
  {
    team: 'Green Wolves',
    type: '5x5',
    players: 2,
    contact: '+998 90 323 44 12',
  },
  {
    team: 'Metro United',
    type: '7x7',
    players: 3,
    contact: '+998 91 876 54 22',
  },
  {
    team: 'City Rush',
    type: '11x11',
    players: 1,
    contact: '+998 93 214 13 57',
  },
];

const filters = {
  type: 'hammasi',
  status: 'hammasi',
  price: 'all',
  rating: 'all',
  search: '',
};

const state = {
  stadiums: loadFromStorage(STORAGE_KEYS.stadiums, defaultStadiums),
  favorites: loadFromStorage(STORAGE_KEYS.favorites, []),
  locks: loadFromStorage(STORAGE_KEYS.locks, {}),
  requests: loadFromStorage(STORAGE_KEYS.requests, defaultRequests),
  recurringBookings: loadFromStorage(STORAGE_KEYS.recurringBookings, []),
  selectedStadium: null,
  selectedSlot: '',
  bookingTimer: null,
};

let globalMap;
let locationMap;

initialize();

function initialize() {
  applyTheme(getStoredTheme());
  renderWeather();
  renderNews();
  renderRequests();
  renderAdminList();
  bindEvents();
  renderRecurringBookings();
  renderStadiums();
  initializeMainMap();
  startLockTicker();
}

function bindEvents() {
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('downloadAppBtn')?.addEventListener('click', downloadCurrentPageAsHtml);
  const recurringToggle = document.getElementById('recurringBookingToggle');
  const recurringSlotField = document.getElementById('recurringSlotField');
  if (recurringToggle && recurringSlotField) {
    recurringToggle.addEventListener('change', () => {
      recurringSlotField.classList.toggle('visible', recurringToggle.checked);
    });
  }

  document.getElementById('globalSearch').addEventListener('input', (event) => {
    filters.search = event.target.value.trim().toLowerCase();
    renderStadiums();
  });

  document.getElementById('typeFilter').addEventListener('change', (event) => {
    filters.type = event.target.value;
    renderStadiums();
  });

  document.getElementById('statusFilter').addEventListener('change', (event) => {
    filters.status = event.target.value;
    renderStadiums();
  });

  document.getElementById('priceFilter').addEventListener('change', (event) => {
    filters.price = event.target.value;
    renderStadiums();
  });

  document.getElementById('ratingFilter').addEventListener('change', (event) => {
    filters.rating = event.target.value;
    renderStadiums();
  });

  document.getElementById('resetFilters').addEventListener('click', () => {
    filters.type = 'hammasi';
    filters.status = 'hammasi';
    filters.price = 'all';
    filters.rating = 'all';
    filters.search = '';
    document.getElementById('globalSearch').value = '';
    document.getElementById('typeFilter').value = 'hammasi';
    document.getElementById('statusFilter').value = 'hammasi';
    document.getElementById('priceFilter').value = 'all';
    document.getElementById('ratingFilter').value = 'all';
    renderStadiums();
  });

  document.getElementById('requestForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const team = document.getElementById('teamName').value.trim();
    const type = document.getElementById('matchType').value;
    const players = Number(document.getElementById('playerCount').value);
    const contact = document.getElementById('contactInfo').value.trim();

    if (!team || !contact) return;

    state.requests.unshift({ team, type, players, contact });
    saveToStorage(STORAGE_KEYS.requests, state.requests);
    renderRequests();
    event.target.reset();
    document.getElementById('playerCount').value = '2';
  });

  document.getElementById('adminForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const newStadium = {
      id: `st-${Date.now()}`,
      name: document.getElementById('adminName').value.trim(),
      type: document.getElementById('adminType').value,
      district: document.getElementById('adminDistrict').value.trim(),
      price: Number(document.getElementById('adminPrice').value),
      discount: Number(document.getElementById('adminDiscount').value),
      rating: 4.7,
      reviews: 13,
      status: true,
      phone: document.getElementById('adminPhone').value.trim(),
      coords: [Number(document.getElementById('adminLat').value), Number(document.getElementById('adminLng').value)],
      slots: parseSlots(document.getElementById('adminSlots').value),
    };

    state.stadiums.unshift(newStadium);
    saveToStorage(STORAGE_KEYS.stadiums, state.stadiums);
    renderStadiums();
    renderAdminList();
    initializeMainMap();
    event.target.reset();
    document.getElementById('adminPrice').value = '120000';
    document.getElementById('adminDiscount').value = '15';
    document.getElementById('adminLat').value = '41.3111';
    document.getElementById('adminLng').value = '69.2797';
  });

  document.getElementById('toggleAdminPanel').addEventListener('click', () => {
    const section = document.getElementById('adminPanel');
    section.classList.toggle('hidden');
  });

  document.getElementById('bookingForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    if (!name || !phone || !state.selectedStadium || !state.selectedSlot) return;

    const recurringEnabled = document.getElementById('recurringBookingToggle').checked;
    const recurringSlot = document.getElementById('recurringSlotSelect')?.value || state.selectedSlot;
    const friendCount = Number(document.getElementById('recurringFriendsCount')?.value || 1);

    if (recurringEnabled) {
      const recurringBooking = {
        id: `rec-${Date.now()}`,
        stadiumId: state.selectedStadium.id,
        stadiumName: state.selectedStadium.name,
        district: state.selectedStadium.district,
        slot: recurringSlot,
        friends: friendCount,
        day: 'Friday',
        active: true,
        createdAt: new Date().toISOString(),
      };
      state.recurringBookings.unshift(recurringBooking);
      saveToStorage(STORAGE_KEYS.recurringBookings, state.recurringBookings);
      renderRecurringBookings();
    }

    const key = `${state.selectedStadium.id}:${state.selectedSlot}`;
    const lock = state.locks[key];
    if (lock && lock.expiresAt > Date.now()) {
      state.locks[key] = { expiresAt: Date.now() + 5 * 60 * 1000 };
      saveToStorage(STORAGE_KEYS.locks, state.locks);
    }

    openModal('successModal');
    closeModal('bookingModal');
    setTimeout(() => {
      confetti({ particleCount: 180, spread: 120, startVelocity: 40, origin: { y: 0.65 } });
    }, 100);
    renderStadiums();
    clearInterval(state.bookingTimer);
    state.bookingTimer = null;
    state.selectedStadium = null;
    state.selectedSlot = '';
    document.getElementById('bookingForm').reset();
    const recurringToggle = document.getElementById('recurringBookingToggle');
    const recurringSlotField = document.getElementById('recurringSlotField');
    if (recurringToggle) recurringToggle.checked = false;
    if (recurringSlotField) recurringSlotField.classList.remove('visible');
  });

  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => {
      closeModal(button.dataset.close);
    });
  });
}

function renderWeather() {
  const weather = [
    { temp: 24, rain: 28, wind: 12, humidity: 63, label: 'Bulutli' },
    { temp: 22, rain: 32, wind: 10, humidity: 60, label: 'Yomg\'ir' },
    { temp: 26, rain: 18, wind: 14, humidity: 57, label: 'Quyoshli' },
  ];
  const item = weather[Math.floor(Date.now() / 1000) % weather.length];
  document.getElementById('weatherTemp').textContent = `${item.temp}°`;
  document.getElementById('weatherRain').textContent = `${item.rain}%`;
  document.getElementById('weatherWind').textContent = `${item.wind} km/s`;
  document.getElementById('weatherHumidity').textContent = `${item.humidity}%`;
  document.querySelector('.weather-card .text-lg').textContent = item.label;
}

function renderNews() {
  const newsGrid = document.getElementById('newsGrid');
  newsGrid.innerHTML = defaultNews
    .map(
      (news) => `
        <article class="news-card">
          <div class="news-media"></div>
          <div class="news-content">
            <span class="news-category"><i class="fa-solid fa-bullhorn"></i> ${news.category}</span>
            <h3>${news.title}</h3>
            <p>${news.summary}</p>
          </div>
        </article>
      `
    )
    .join('');
}

function renderRequests() {
  const container = document.getElementById('teamRequests');
  container.innerHTML = state.requests
    .map(
      (request) => `
        <article class="request-card">
          <div class="request-top">
            <h4>${request.team}</h4>
            <span class="badge-live ok"><span class="live-dot"></span>Faol</span>
          </div>
          <div class="request-meta">
            <span class="pill"><i class="fa-solid fa-futbol"></i> ${request.type}</span>
            <span class="pill"><i class="fa-solid fa-user-group"></i> ${request.players} kishi</span>
            <span class="pill"><i class="fa-solid fa-phone"></i> ${request.contact}</span>
          </div>
        </article>
      `
    )
    .join('');
}

function renderStadiums() {
  const grid = document.getElementById('stadiumGrid');
  const filtered = getFilteredStadiums();
  document.getElementById('resultCount').textContent = `${filtered.length} ta natija`;

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="col-span-full section-card p-10 text-center">
        <i class="fa-solid fa-magnifying-glass text-3xl text-emerald-500 mb-4"></i>
        <h3 class="text-2xl font-black">Natija topilmadi</h3>
        <p class="mt-2 text-slate-500 dark:text-slate-400">Filtrlarni o'zgartirib yana qidiring.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map((stadium) => {
      const isFavorite = state.favorites.includes(stadium.id);
      const isLocked = isSlotLocked(stadium.id);
      const slots = stadium.slots
        .map((slot) => {
          const key = `${stadium.id}:${slot}`;
          const locked = state.locks[key] && state.locks[key].expiresAt > Date.now();
          return `<button class="slot-btn ${locked ? 'locked' : ''}" data-slot="${slot}" data-id="${stadium.id}" ${locked ? 'disabled' : ''}>${slot}</button>`;
        })
        .join('');

      return `
        <article class="stadium-card">
          <div class="stadium-card-image p-4">
            <div class="stadium-topbar">
              <span class="badge-live ${stadium.status ? 'ok' : 'bad'}">
                <span class="live-dot"></span>
                ${stadium.status ? 'Bosh' : 'Bosh emas'}
              </span>
              <div class="inline-flex items-center gap-2">
                <span class="type-tag">${stadium.type}</span>
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-favorite="${stadium.id}" aria-label="Sevimlilar">
                  <i class="${isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
                </button>
              </div>
            </div>
            <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span class="discount-tag">${stadium.discount}% chegirma</span>
            </div>
          </div>

          <div class="card-body">
            <div class="location-row">
              <span><i class="fa-solid fa-location-dot text-emerald-500"></i> ${stadium.district}</span>
              <span class="text-slate-500 dark:text-slate-400">${isLocked ? 'Mavjud emas' : 'Hozir tayyor'}</span>
            </div>

            <h3 class="card-title">${stadium.name}</h3>
            <div class="rating-row">
              <span class="star"><i class="fa-solid fa-star"></i> ${stadium.rating}</span>
              <span>(${stadium.reviews} sharh)</span>
            </div>

            <div class="price-row">
              <div class="price-box">
                <span class="label">Narx</span>
                <span class="value">${formatPrice(stadium.price)}</span>
              </div>
              <a href="tel:${stadium.phone.replace(/\s+/g, '')}" class="small-btn">
                <i class="fa-solid fa-phone"></i>
                Qo'ng'iroq
              </a>
            </div>

            <div class="slot-list mt-4">${slots}</div>

            <div class="card-actions">
              <button class="map-btn" data-map="${stadium.id}">
                <i class="fa-solid fa-map-location-dot"></i>
                Xaritada ko'rish
              </button>
              <button class="book-btn" data-book="${stadium.id}">
                <i class="fa-solid fa-calendar-check"></i>
                Bron qilish
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  bindCardActions();
}

function bindCardActions() {
  document.querySelectorAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.favorite;
      toggleFavorite(id);
    });
  });

  document.querySelectorAll('[data-map]').forEach((button) => {
    button.addEventListener('click', () => {
      const stadium = state.stadiums.find((item) => item.id === button.dataset.map);
      if (!stadium) return;
      openMapModal(stadium);
    });
  });

  document.querySelectorAll('[data-book]').forEach((button) => {
    button.addEventListener('click', () => {
      const stadium = state.stadiums.find((item) => item.id === button.dataset.book);
      if (!stadium) return;
      state.selectedStadium = stadium;
      document.getElementById('bookingTitle').textContent = stadium.name;
      document.getElementById('selectedSlotDisplay').value = 'Vaqt tanlanmagan';
      document.getElementById('summaryName').textContent = stadium.name;
      document.getElementById('summaryPrice').textContent = formatPrice(stadium.price);
      document.getElementById('summaryType').textContent = stadium.type;
      updateLockTimer(5 * 60);
      openModal('bookingModal');
    });
  });

  document.querySelectorAll('.slot-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const stadiumId = button.dataset.id;
      const slot = button.dataset.slot;
      const stadium = state.stadiums.find((item) => item.id === stadiumId);
      if (!stadium) return;
      if (isSlotLocked(stadiumId, slot)) return;

      state.selectedStadium = stadium;
      state.selectedSlot = slot;
      document.getElementById('bookingTitle').textContent = stadium.name;
      document.getElementById('selectedSlotDisplay').value = slot;
      document.getElementById('summaryName').textContent = stadium.name;
      document.getElementById('summaryPrice').textContent = formatPrice(stadium.price);
      document.getElementById('summaryType').textContent = stadium.type;
      lockSlot(stadiumId, slot, 5 * 60 * 1000);
      updateLockTimer(5 * 60);
      openModal('bookingModal');
    });
  });
}

function getFilteredStadiums() {
  return state.stadiums.filter((stadium) => {
    const matchesSearch = !filters.search || stadium.name.toLowerCase().includes(filters.search) || stadium.district.toLowerCase().includes(filters.search);
    const matchesType = filters.type === 'hammasi' || stadium.type === filters.type;
    const matchesStatus =
      filters.status === 'hammasi' ||
      (filters.status === "bo'sh" && stadium.status) ||
      (filters.status === 'barcha' && !stadium.status);
    const matchesPrice =
      filters.price === 'all' ||
      (filters.price === '0-150000' && stadium.price <= 150000) ||
      (filters.price === '150001-250000' && stadium.price > 150000 && stadium.price <= 250000) ||
      (filters.price === '250001-500000' && stadium.price > 250000 && stadium.price <= 500000);
    const matchesRating = filters.rating === 'all' || stadium.rating >= Number(filters.rating);

    return matchesSearch && matchesType && matchesStatus && matchesPrice && matchesRating;
  });
}

function toggleFavorite(stadiumId) {
  const exists = state.favorites.includes(stadiumId);
  if (exists) {
    state.favorites = state.favorites.filter((id) => id !== stadiumId);
  } else {
    state.favorites.push(stadiumId);
  }
  saveToStorage(STORAGE_KEYS.favorites, state.favorites);
  renderStadiums();
}

function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function parseSlots(str) {
  return str
    .split(',')
    .map((slot) => slot.trim())
    .filter(Boolean);
}

function formatPrice(value) {
  return `${new Intl.NumberFormat('uz-UZ').format(value)} so'm`;
}

function createReliableTileLayer() {
  return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
    crossOrigin: true,
    noWrap: false,
  });
}

function initializeMainMap() {
  if (globalMap) {
    globalMap.remove();
  }

  globalMap = L.map('stadiumMap', {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([41.3111, 69.2797], 11);

  createReliableTileLayer().addTo(globalMap);

  state.stadiums.forEach((stadium) => {
    const marker = L.marker(stadium.coords).addTo(globalMap);
    marker.bindPopup(`
      <div style="min-width: 140px;">
        <strong>${stadium.name}</strong><br>
        <span>${stadium.district}</span><br>
        <span>${stadium.type}</span>
      </div>
    `);
  });
}

function openMapModal(stadium) {
  const modal = document.getElementById('mapModal');
  modal.classList.remove('hidden');
  document.getElementById('mapModalTitle').textContent = stadium.name;

  setTimeout(() => {
    if (locationMap) {
      locationMap.remove();
    }
    locationMap = L.map('locationMap', {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(stadium.coords, 14);

    createReliableTileLayer().addTo(locationMap);
    L.marker(stadium.coords)
      .addTo(locationMap)
      .bindPopup(`<b>${stadium.name}</b><br>${stadium.district}`)
      .openPopup();
  }, 100);
}

function lockSlot(stadiumId, slot, durationMs) {
  const key = `${stadiumId}:${slot}`;
  state.locks[key] = { expiresAt: Date.now() + durationMs };
  saveToStorage(STORAGE_KEYS.locks, state.locks);
}

function isSlotLocked(stadiumId, slot = null) {
  const keys = slot
    ? [`${stadiumId}:${slot}`]
    : Object.keys(state.locks).filter((key) => key.startsWith(`${stadiumId}:`));

  return keys.some((key) => {
    const lock = state.locks[key];
    return lock && lock.expiresAt > Date.now();
  });
}

function updateLockTimer(secondsLeft) {
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  document.getElementById('lockTimer').textContent = `${minutes}:${seconds}`;

  if (state.bookingTimer) clearInterval(state.bookingTimer);

  state.bookingTimer = setInterval(() => {
    const remaining = Math.max(0, Math.floor((state.selectedStadium ? getCurrentLockRemaining() : 0) / 1000));
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    document.getElementById('lockTimer').textContent = `${mm}:${ss}`;
    if (remaining <= 0) {
      clearInterval(state.bookingTimer);
      state.bookingTimer = null;
    }
  }, 100);
}

function getCurrentLockRemaining() {
  if (!state.selectedStadium || !state.selectedSlot) return 0;
  const key = `${state.selectedStadium.id}:${state.selectedSlot}`;
  const lock = state.locks[key];
  if (!lock) return 0;
  return Math.max(0, lock.expiresAt - Date.now());
}

function startLockTicker() {
  setInterval(() => {
    const now = Date.now();
    Object.keys(state.locks).forEach((key) => {
      if (state.locks[key].expiresAt <= now) {
        delete state.locks[key];
      }
    });
    saveToStorage(STORAGE_KEYS.locks, state.locks);
    renderStadiums();
  }, 100);
}

function applyTheme(theme) {
  const root = document.documentElement;
  const isLight = theme === 'light';
  root.classList.toggle('light', isLight);
  root.classList.toggle('dark', !isLight);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const nextTheme = isDark ? 'light' : 'dark';
  applyTheme(nextTheme);
  localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
}

function getStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  if (stored) {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function renderAdminList() {
  const container = document.getElementById('adminList');
  container.innerHTML = state.stadiums
    .slice(0, 5)
    .map(
      (stadium) => `
        <div class="admin-list-item">
          <div>
            <div class="font-bold">${stadium.name}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">${stadium.type} • ${stadium.district}</div>
          </div>
          <div class="admin-controls">
            <button class="small-btn" data-admin-toggle="${stadium.id}">${stadium.status ? 'Bosh' : 'Bosh emas'}</button>
            <button class="small-btn danger" data-admin-delete="${stadium.id}">O'chirish</button>
          </div>
        </div>
      `
    )
    .join('');

  document.querySelectorAll('[data-admin-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.adminToggle;
      const stadium = state.stadiums.find((item) => item.id === id);
      if (!stadium) return;
      stadium.status = !stadium.status;
      saveToStorage(STORAGE_KEYS.stadiums, state.stadiums);
      renderStadiums();
      renderAdminList();
    });
  });

  document.querySelectorAll('[data-admin-delete]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.adminDelete;
      state.stadiums = state.stadiums.filter((item) => item.id !== id);
      saveToStorage(STORAGE_KEYS.stadiums, state.stadiums);
      renderStadiums();
      renderAdminList();
      initializeMainMap();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof confetti === 'function') {
    window.confetti = confetti;
  }
});

function downloadCurrentPageAsHtml() {
  const html = document.documentElement.outerHTML;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'stadionly-page.html';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.getElementById('downloadAppBtn').addEventListener('click', downloadCurrentPageAsHtml);
