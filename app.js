/**
 * Gestor de Contactos Pro - Application Logic
 */

// Initial Sample Data for Quick Testing
const DEMO_CONTACTS = [
  {
    id: "demo-1",
    name: "Ana Sofía Mendoza",
    phone: "+34 612 849 201",
    email: "ana.mendoza@empresa.com",
    category: "Trabajo",
    notes: "Directora de Proyectos UX/UI",
    favorite: true,
    createdAt: Date.now() - 10000000
  },
  {
    id: "demo-2",
    name: "Carlos Alberto Rodríguez",
    phone: "+52 55 4192 8301",
    email: "carlos.rod@gmail.com",
    category: "Familia",
    notes: "Hermano - Cumpleaños 14 de Mayo",
    favorite: true,
    createdAt: Date.now() - 8000000
  },
  {
    id: "demo-3",
    name: "Elena Gómez Silva",
    phone: "+34 699 123 456",
    email: "elena.gomez@techvision.io",
    category: "Amigos",
    notes: "Compañera de gimnasio y fotografía",
    favorite: false,
    createdAt: Date.now() - 5000000
  },
  {
    id: "demo-4",
    name: "Dr. Roberto Fernández",
    phone: "+34 91 555 7890",
    email: "consultas@drfernandez.es",
    category: "Otros",
    notes: "Médico de cabecera",
    favorite: false,
    createdAt: Date.now() - 2000000
  }
];

// Color palette generator for initial-based avatars
const AVATAR_COLORS = [
  'linear-gradient(135deg, #ff758c, #ff7eb3)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #a855f7, #ec4899)',
  'linear-gradient(135deg, #f472b6, #fb7185)',
  'linear-gradient(135deg, #fb923c, #f43f5e)',
  'linear-gradient(135deg, #c084fc, #f472b6)',
  'linear-gradient(135deg, #f43f5e, #fda4af)'
];

class ContactApp {
  constructor() {
    this.contacts = JSON.parse(localStorage.getItem('app_contacts')) || [];
    this.theme = localStorage.getItem('app_theme') || 'dark';
    this.viewMode = localStorage.getItem('app_view') || 'grid';
    this.currentFilter = 'all';
    this.searchTerm = '';
    this.sortBy = 'name-asc';
    this.pendingDeleteId = null;
    this.lastDeletedContact = null;
    this.toastTimer = null;

    // Load Demo Data if empty on first launch
    if (this.contacts.length === 0) {
      this.contacts = [...DEMO_CONTACTS];
      this.saveContacts();
    }

    this.initDOM();
    this.applyTheme(this.theme);
    this.bindEvents();
    this.render();
  }

  initDOM() {
    // Buttons & Controls
    this.btnThemeToggle = document.getElementById('btn-theme-toggle');
    this.iconSun = document.getElementById('icon-sun');
    this.iconMoon = document.getElementById('icon-moon');
    
    this.btnOpenAddModal = document.getElementById('btn-open-add-modal');
    this.contactsContainer = document.getElementById('contacts-container');
    this.emptyState = document.getElementById('empty-state');
    this.emptyTitle = document.getElementById('empty-title');
    this.emptyDesc = document.getElementById('empty-description');
    this.btnResetFilters = document.getElementById('btn-reset-filters');
    this.btnLoadDemo = document.getElementById('btn-load-demo');
    this.totalContactsCount = document.getElementById('total-contacts-count');

    // Search & Filters
    this.searchInput = document.getElementById('search-input');
    this.btnClearSearch = document.getElementById('btn-clear-search');
    this.categoryPills = document.getElementById('category-filters');
    this.sortSelect = document.getElementById('sort-select');
    this.btnViewGrid = document.getElementById('btn-view-grid');
    this.btnViewList = document.getElementById('btn-view-list');

    // Export Dropdown
    this.btnExportMenu = document.getElementById('btn-export-menu');
    this.exportDropdown = document.getElementById('export-dropdown');
    this.btnExportJSON = document.getElementById('btn-export-json');
    this.btnExportCSV = document.getElementById('btn-export-csv');

    // Contact Modal
    this.contactModal = document.getElementById('contact-modal');
    this.contactForm = document.getElementById('contact-form');
    this.modalTitle = document.getElementById('modal-title');
    this.contactIdInput = document.getElementById('contact-id');
    this.nameInput = document.getElementById('contact-name');
    this.phoneInput = document.getElementById('contact-phone');
    this.emailInput = document.getElementById('contact-email');
    this.categorySelect = document.getElementById('contact-category');
    this.favoriteInput = document.getElementById('contact-favorite');
    this.notesInput = document.getElementById('contact-notes');
    this.btnCloseModal = document.getElementById('btn-close-modal');
    this.btnCancelModal = document.getElementById('btn-cancel-modal');

    // Delete Modal
    this.deleteModal = document.getElementById('delete-modal');
    this.deleteContactName = document.getElementById('delete-contact-name');
    this.btnCloseDeleteModal = document.getElementById('btn-close-delete-modal');
    this.btnCancelDelete = document.getElementById('btn-cancel-delete');
    this.btnConfirmDelete = document.getElementById('btn-confirm-delete');

    // Toast Container
    this.toastContainer = document.getElementById('toast-container');
  }

  bindEvents() {
    // Theme Switcher
    this.btnThemeToggle.addEventListener('click', () => {
      const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(nextTheme);
    });

    // View Mode Switcher
    this.btnViewGrid.addEventListener('click', () => this.setViewMode('grid'));
    this.btnViewList.addEventListener('click', () => this.setViewMode('list'));

    // Search Input
    this.searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.trim().toLowerCase();
      this.btnClearSearch.classList.toggle('hidden', this.searchTerm.length === 0);
      this.render();
    });

    this.btnClearSearch.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchTerm = '';
      this.btnClearSearch.classList.add('hidden');
      this.render();
    });

    // Category Filter Pills
    this.categoryPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      
      this.categoryPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      this.currentFilter = pill.dataset.category;
      this.render();
    });

    // Sort Select
    this.sortSelect.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.render();
    });

    // Export Options
    this.btnExportMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      this.exportDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      this.exportDropdown.classList.add('hidden');
    });

    this.btnExportJSON.addEventListener('click', () => this.exportContactsJSON());
    this.btnExportCSV.addEventListener('click', () => this.exportContactsCSV());

    // Modal Control
    this.btnOpenAddModal.addEventListener('click', () => this.openContactModal());
    this.btnCloseModal.addEventListener('click', () => this.closeContactModal());
    this.btnCancelModal.addEventListener('click', () => this.closeContactModal());
    this.contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Delete Modal Control
    this.btnCloseDeleteModal.addEventListener('click', () => this.closeDeleteModal());
    this.btnCancelDelete.addEventListener('click', () => this.closeDeleteModal());
    this.btnConfirmDelete.addEventListener('click', () => this.confirmDeleteContact());

    // Reset Filters & Load Demo
    this.btnResetFilters.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchTerm = '';
      this.currentFilter = 'all';
      this.btnClearSearch.classList.add('hidden');
      this.categoryPills.querySelectorAll('.pill').forEach(p => {
        p.classList.toggle('active', p.dataset.category === 'all');
      });
      this.render();
    });

    this.btnLoadDemo.addEventListener('click', () => {
      this.contacts = [...DEMO_CONTACTS];
      this.saveContacts();
      const tr = (window.i18n ? window.i18n.t.bind(window.i18n) : k => k);
      this.showToast(tr('toastDemoLoaded'), 'success');
      this.render();
    });
  }

  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
    if (theme === 'dark') {
      this.iconSun.classList.remove('hidden');
      this.iconMoon.classList.add('hidden');
    } else {
      this.iconSun.classList.add('hidden');
      this.iconMoon.classList.remove('hidden');
    }
  }

  setViewMode(mode) {
    this.viewMode = mode;
    localStorage.setItem('app_view', mode);
    this.btnViewGrid.classList.toggle('active', mode === 'grid');
    this.btnViewList.classList.toggle('active', mode === 'list');
    this.contactsContainer.className = mode === 'grid' ? 'grid-layout' : 'list-layout';
  }

  saveContacts() {
    localStorage.setItem('app_contacts', JSON.stringify(this.contacts));
    this.totalContactsCount.textContent = this.contacts.length;
  }

  getFilteredContacts() {
    let filtered = [...this.contacts];

    // Filter by Category or Favorite
    if (this.currentFilter === 'favorite') {
      filtered = filtered.filter(c => c.favorite);
    } else if (this.currentFilter !== 'all') {
      filtered = filtered.filter(c => c.category === this.currentFilter);
    }

    // Filter by Search Query
    if (this.searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(this.searchTerm) ||
        c.phone.toLowerCase().includes(this.searchTerm) ||
        (c.email && c.email.toLowerCase().includes(this.searchTerm)) ||
        (c.notes && c.notes.toLowerCase().includes(this.searchTerm))
      );
    }

    // Sort Contacts
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
        case 'name-desc':
          return b.name.localeCompare(a.name, 'es', { sensitivity: 'base' });
        case 'newest':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'oldest':
          return (a.createdAt || 0) - (b.createdAt || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }

  render() {
    this.setViewMode(this.viewMode);
    const visibleContacts = this.getFilteredContacts();

    this.contactsContainer.innerHTML = '';
    this.totalContactsCount.textContent = this.contacts.length;

    if (visibleContacts.length === 0) {
      this.contactsContainer.classList.add('hidden');
      this.emptyState.classList.remove('hidden');

      const tr = (window.i18n ? window.i18n.t.bind(window.i18n) : k => k);
      if (this.contacts.length === 0) {
        this.emptyTitle.textContent = tr('emptyAgendaTitle');
        this.emptyDesc.textContent = tr('emptyAgendaDesc');
        this.btnResetFilters.classList.add('hidden');
        this.btnLoadDemo.classList.remove('hidden');
      } else {
        this.emptyTitle.textContent = tr('emptySearchTitle');
        this.emptyDesc.textContent = tr('emptySearchDesc');
        this.btnResetFilters.classList.remove('hidden');
        this.btnLoadDemo.classList.add('hidden');
      }
      return;
    }

    this.emptyState.classList.add('hidden');
    this.contactsContainer.classList.remove('hidden');

    const fragment = document.createDocumentFragment();
    visibleContacts.forEach(contact => {
      const card = this.createContactCard(contact);
      fragment.appendChild(card);
    });

    this.contactsContainer.appendChild(fragment);
  }

  createContactCard(contact) {
    const card = document.createElement('article');
    card.className = 'contact-card';
    card.dataset.id = contact.id;

    // Generate Initials & Avatar Color
    const initials = this.getInitials(contact.name);
    const colorIndex = Math.abs(this.hashCode(contact.name)) % AVATAR_COLORS.length;
    const avatarBg = AVATAR_COLORS[colorIndex];

    const cleanPhone = contact.phone.replace(/[^\d+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}`;

    const tr = (window.i18n ? window.i18n.t.bind(window.i18n) : k => k);
    card.innerHTML = `
      <div class="card-header">
        <div class="avatar" style="background: ${avatarBg}">${initials}</div>
        <div class="info">
          <div class="info-name-row">
            <h3 class="contact-name" title="${this.escapeHTML(contact.name)}">${this.escapeHTML(contact.name)}</h3>
            <button class="btn-star ${contact.favorite ? 'active' : ''}" title="${contact.favorite ? tr('starRemove') : tr('starAdd')}" data-action="toggle-star">
              ★
            </button>
          </div>
          <span class="category-badge ${contact.category}">${contact.category}</span>
        </div>
      </div>

      <div class="card-details">
        <div class="detail-item" title="${tr('cardPhone')}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>${this.escapeHTML(contact.phone)}</span>
        </div>

        ${contact.email ? `
        <div class="detail-item" title="${tr('cardEmail')}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span>${this.escapeHTML(contact.email)}</span>
        </div>
        ` : ''}

        ${contact.notes ? `<p class="contact-notes" title="${this.escapeHTML(contact.notes)}">${this.escapeHTML(contact.notes)}</p>` : ''}
      </div>

      <div class="card-actions">
        <div class="quick-communication">
          <a href="tel:${cleanPhone}" class="action-icon-btn" title="${tr('cardCall')}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </a>
          ${contact.email ? `
          <a href="mailto:${contact.email}" class="action-icon-btn" title="${tr('cardMail')}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
          ` : ''}
          <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="action-icon-btn whatsapp" title="${tr('cardWhatsApp')}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </a>
        </div>

        <div class="card-manage-btns">
          <button class="btn-card-edit" title="${tr('cardEdit')}" data-action="edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </button>
          <button class="btn-card-delete" title="${tr('cardDelete')}" data-action="delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>
    `;

    // Event Delegation inside Card
    card.addEventListener('click', (e) => {
      const btnStar = e.target.closest('[data-action="toggle-star"]');
      const btnEdit = e.target.closest('[data-action="edit"]');
      const btnDelete = e.target.closest('[data-action="delete"]');

      if (btnStar) {
        this.toggleFavorite(contact.id);
      } else if (btnEdit) {
        this.openContactModal(contact);
      } else if (btnDelete) {
        this.promptDeleteContact(contact);
      }
    });

    return card;
  }

  toggleFavorite(id) {
    const contact = this.contacts.find(c => c.id === id);
    if (contact) {
      contact.favorite = !contact.favorite;
      this.saveContacts();
      this.render();
      const tr = (window.i18n ? window.i18n.t.bind(window.i18n) : k => k);
      this.showToast(contact.favorite ? `⭐ ${contact.name} ${tr('toastAdded')}` : tr('toastRemoved'), 'success');
    }
  }

  // Modal Handlers
  openContactModal(contactToEdit = null) {
    this.contactForm.reset();
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

    const tr = (window.i18n ? window.i18n.t.bind(window.i18n) : k => k);
    if (contactToEdit) {
      this.modalTitle.textContent = tr('modalTitleEdit');
      this.contactIdInput.value = contactToEdit.id;
      this.nameInput.value = contactToEdit.name;
      this.phoneInput.value = contactToEdit.phone;
      this.emailInput.value = contactToEdit.email || '';
      this.categorySelect.value = contactToEdit.category || 'Otros';
      this.favoriteInput.checked = contactToEdit.favorite || false;
      this.notesInput.value = contactToEdit.notes || '';
    } else {
      this.modalTitle.textContent = tr('modalTitleNew');
      this.contactIdInput.value = '';
    }

    this.contactModal.classList.remove('hidden');
    setTimeout(() => this.nameInput.focus(), 100);
  }

  closeContactModal() {
    this.contactModal.classList.add('hidden');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    
    const id = this.contactIdInput.value;
    const name = this.nameInput.value.trim();
    const phone = this.phoneInput.value.trim();
    const email = this.emailInput.value.trim();
    const category = this.categorySelect.value;
    const favorite = this.favoriteInput.checked;
    const notes = this.notesInput.value.trim();

    const tr = (window.i18n ? window.i18n.t.bind(window.i18n) : k => k);
    // Basic Validation
    if (!name) {
      document.getElementById('name-error').textContent = tr('validName');
      return;
    }

    if (!phone) {
      document.getElementById('phone-error').textContent = tr('validPhone');
      return;
    }

    if (id) {
      // Edit existing contact
      const index = this.contacts.findIndex(c => c.id === id);
      if (index !== -1) {
        this.contacts[index] = {
          ...this.contacts[index],
          name, phone, email, category, favorite, notes
        };
        this.showToast(`"${name}" ${tr('toastUpdated')}`, 'success');
      }
    } else {
      // Create new contact
      const newContact = {
        id: 'contact-' + Date.now(),
        name, phone, email, category, favorite, notes,
        createdAt: Date.now()
      };
      this.contacts.unshift(newContact);
      this.showToast(`"${name}" ${tr('toastSaved')}`, 'success');
    }

    this.saveContacts();
    this.closeContactModal();
    this.render();
  }

  // Delete Flow with Undo
  promptDeleteContact(contact) {
    this.pendingDeleteId = contact.id;
    this.deleteContactName.textContent = contact.name;
    this.deleteModal.classList.remove('hidden');
  }

  closeDeleteModal() {
    this.deleteModal.classList.add('hidden');
    this.pendingDeleteId = null;
  }

  confirmDeleteContact() {
    if (!this.pendingDeleteId) return;

    const index = this.contacts.findIndex(c => c.id === this.pendingDeleteId);
    if (index !== -1) {
      this.lastDeletedContact = {
        contact: this.contacts[index],
        index: index
      };

      const deletedName = this.contacts[index].name;
      this.contacts.splice(index, 1);
      this.saveContacts();
      this.render();

      const tr2 = (window.i18n ? window.i18n.t.bind(window.i18n) : k => k);
      this.showToastWithUndo(`"${deletedName}" ${tr2('toastDeleted')}`);
    }

    this.closeDeleteModal();
  }

  undoDelete() {
    if (this.lastDeletedContact) {
      const { contact, index } = this.lastDeletedContact;
      this.contacts.splice(index, 0, contact);
      this.saveContacts();
      this.lastDeletedContact = null;
      this.render();
      const tr3 = (window.i18n ? window.i18n.t.bind(window.i18n) : k => k);
      this.showToast(`${tr3('toastRestored')} "${contact.name}"`, 'success');
    }
  }

  // Toast Notification System
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${this.escapeHTML(message)}</span>`;
    
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  showToastWithUndo(message) {
    this.toastContainer.innerHTML = ''; // clear previous undo toast
    const toast = document.createElement('div');
    toast.className = 'toast info';
    toast.innerHTML = `
      <span>${this.escapeHTML(message)}</span>
      <button class="btn-toast-undo">Deshacer</button>
    `;

    toast.querySelector('.btn-toast-undo').addEventListener('click', () => {
      this.undoDelete();
      toast.remove();
    });

    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  }

  // Data Export Functions
  exportContactsJSON() {
    const tr = (window.i18n ? window.i18n.t.bind(window.i18n) : k => k);
    if (this.contacts.length === 0) {
      this.showToast(tr('toastNoExport'), 'error');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.contacts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `contactos_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    const tr4 = (window.i18n ? window.i18n.t.bind(window.i18n) : k => k);
    this.showToast(tr4('toastExportedJson'), 'success');
  }

  exportContactsCSV() {
    const tr = (window.i18n ? window.i18n.t.bind(window.i18n) : k => k);
    if (this.contacts.length === 0) {
      this.showToast(tr('toastNoExport'), 'error');
      return;
    }

    const headers = ["Nombre", "Teléfono", "Email", "Categoría", "Favorito", "Notas"];
    const rows = this.contacts.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${c.category}"`,
      c.favorite ? 'Sí' : 'No',
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `contactos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    const tr5 = (window.i18n ? window.i18n.t.bind(window.i18n) : k => k);
    this.showToast(tr5('toastExportedCsv'), 'success');
  }

  // Helpers
  getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

/**
 * THIFI AI Floating Chat Assistant
 */
class ThifiAssistant {
  constructor(app) {
    this.app = app;
    this.messages = JSON.parse(localStorage.getItem('thifi_chat_history')) || [];
    this.tickets = JSON.parse(localStorage.getItem('app_support_tickets')) || [];
    this.isOpen = false;
    this.isTyping = false;

    this.initDOM();
    this.bindEvents();

    if (this.messages.length === 0) {
      this.addWelcomeMessage();
    } else {
      this.renderHistory();
    }
  }

  initDOM() {
    this.triggerBtn = document.getElementById('thifi-chat-trigger');
    this.chatContainer = document.getElementById('thifi-chat-container');
    this.btnClose = document.getElementById('btn-thifi-close');
    this.btnClear = document.getElementById('btn-thifi-clear');
    this.messagesContainer = document.getElementById('thifi-chat-messages');
    this.typingIndicator = document.getElementById('thifi-typing-indicator');
    this.form = document.getElementById('thifi-chat-form');
    this.input = document.getElementById('thifi-input');
    this.suggestionsContainer = document.getElementById('thifi-suggestions');
  }

  bindEvents() {
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', () => this.toggleChat());
    }

    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.toggleChat(false));
    }

    if (this.btnClear) {
      this.btnClear.addEventListener('click', () => this.clearChat());
    }

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.input.value.trim();
        if (text) {
          this.handleUserInput(text);
          this.input.value = '';
        }
      });
    }

    if (this.suggestionsContainer) {
      this.suggestionsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.thifi-chip');
        if (chip) {
          const query = chip.getAttribute('data-query');
          if (query) {
            this.handleUserInput(query);
          }
        }
      });
    }

    // Keyboard ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.toggleChat(false);
      }
    });

    // Delegated actions inside chat messages
    if (this.messagesContainer) {
      this.messagesContainer.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-thifi-action]');
        if (actionBtn) {
          const action = actionBtn.getAttribute('data-thifi-action');
          const value = actionBtn.getAttribute('data-thifi-value');
          this.handleChatAction(action, value);
        }

        // Inline ticket form submission
        if (e.target.matches('.thifi-btn-submit-ticket')) {
          e.preventDefault();
          const form = e.target.closest('.thifi-ticket-form');
          if (form) {
            const subject = form.querySelector('.thifi-ticket-subject').value.trim();
            const desc = form.querySelector('.thifi-ticket-desc').value.trim();
            const priority = form.querySelector('.thifi-ticket-priority').value;
            if (!subject || !desc) {
              this.app.showToast('Por favor completa el asunto y detalle del problema', 'error');
              return;
            }
            this.submitSupportTicket(subject, desc, priority);
          }
        }
      });
    }
  }

  toggleChat(forceState) {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    if (this.isOpen) {
      this.chatContainer.classList.remove('hidden');
      this.input.focus();
      this.scrollToBottom();
    } else {
      this.chatContainer.classList.add('hidden');
    }
  }

  addWelcomeMessage() {
    const welcomeText = `¡Hola! 👋 Soy **THIFI**, tu asistente virtual con IA para esta agenda.

Puedo ayudarte con:
• 🔍 **Buscar contactos**: Escribe algo como *"busca a Ana"* o *"contactos de Trabajo"*.
• 🎫 **Crear ticket de soporte**: Escribe *"tengo un problema"* o *"crear ticket"*.
• ⚡ **Acciones rápidas**: Añadir contactos, exportar datos o personalizar el tema.

¿En qué puedo ayudarte hoy?`;

    const welcomeMsg = {
      id: Date.now(),
      sender: 'bot',
      text: welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.messages.push(welcomeMsg);
    this.saveMessages();
    this.renderMessage(welcomeMsg);
  }

  renderHistory() {
    this.messagesContainer.innerHTML = '';
    this.messages.forEach(msg => this.renderMessage(msg));
    this.scrollToBottom();
  }

  handleUserInput(text) {
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.messages.push(userMsg);
    this.saveMessages();
    this.renderMessage(userMsg);
    this.scrollToBottom();

    this.showTyping(true);

    // Simulate AI response calculation with realistic delay
    setTimeout(() => {
      this.showTyping(false);
      this.generateAIResponse(text);
    }, 700 + Math.random() * 500);
  }

  generateAIResponse(userText) {
    const textLower = userText.toLowerCase();
    let botResponse = {
      id: Date.now(),
      sender: 'bot',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      extraHTML: ''
    };

    // 1. Search Contacts Intent
    if (
      textLower.includes('busca') || 
      textLower.includes('buscar') || 
      textLower.includes('encontrar') || 
      textLower.includes('encuentra') ||
      textLower.includes('quien es') ||
      textLower.includes('quién es') ||
      textLower.includes('teléfono') ||
      textLower.includes('telefono') ||
      textLower.includes('contacto') ||
      textLower.includes('contactos')
    ) {
      this.handleSearchIntent(textLower, botResponse);
    }
    // 2. Favorites Intent
    else if (textLower.includes('favorito') || textLower.includes('favoritos')) {
      const favorites = this.app.contacts.filter(c => c.favorite);
      if (favorites.length === 0) {
        botResponse.text = "No tienes contactos marcados como favoritos en este momento. ⭐\n\nPuedes marcar un contacto haciendo clic en la estrella al editarlo.";
      } else {
        botResponse.text = `Encontré **${favorites.length}** contacto(s) en tus **Favoritos**: ⭐`;
        botResponse.extraHTML = favorites.map(c => this.buildContactCardHTML(c)).join('');
      }
    }
    // 3. Create Support Ticket Intent
    else if (
      textLower.includes('soporte') || 
      textLower.includes('ticket') || 
      textLower.includes('problema') || 
      textLower.includes('error') || 
      textLower.includes('fallo') || 
      textLower.includes('ayuda técnica') ||
      textLower.includes('reportar') ||
      textLower.includes('no funciona')
    ) {
      botResponse.text = "Lamento que tengas un inconveniente. 🛠️\n\nPuedes crear un **Ticket de Soporte** directamente desde aquí y nuestro sistema lo procesará inmediatamente:";
      botResponse.extraHTML = `
        <form class="thifi-ticket-form">
          <input type="text" class="thifi-ticket-subject" placeholder="Asunto (Ej: Error al guardar contacto)" required>
          <textarea class="thifi-ticket-desc" rows="3" placeholder="Describe tu problema con detalle..." required></textarea>
          <select class="thifi-ticket-priority">
            <option value="Baja">Prioridad: Baja 🟢</option>
            <option value="Media" selected>Prioridad: Media 🟡</option>
            <option value="Alta">Prioridad: Alta 🟠</option>
            <option value="Urgente">Prioridad: Urgente 🔴</option>
          </select>
          <button type="button" class="thifi-btn-submit-ticket">✨ Enviar Ticket de Soporte</button>
        </form>
      `;
    }
    // 4. View Support Tickets Intent
    else if (textLower.includes('mis tickets') || textLower.includes('ver tickets') || textLower.includes('mis soportes')) {
      if (this.tickets.length === 0) {
        botResponse.text = "Actualmente no tienes tickets de soporte registrados. 📋\n\nSi necesitas ayuda con algún fallo, dime *\"crear soporte\"*.";
      } else {
        botResponse.text = `Tienes **${this.tickets.length}** ticket(s) de soporte registrado(s):`;
        botResponse.extraHTML = this.tickets.map(t => `
          <div class="thifi-ticket-card">
            <span class="thifi-ticket-badge">STATUS: ${t.status}</span>
            <div style="font-weight: 700; color: var(--text-primary); margin: 2px 0;">[${t.id}] ${this.app.escapeHTML(t.subject)}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${this.app.escapeHTML(t.desc)}</div>
            <div style="font-size: 0.7rem; opacity: 0.7; margin-top: 4px;">Prioridad: ${t.priority} • Fecha: ${t.date}</div>
          </div>
        `).join('');
      }
    }
    // 5. App Usage Tips & Direct Shortcuts Intent
    else if (textLower.includes('exportar') || textLower.includes('csv') || textLower.includes('json')) {
      botResponse.text = "Puedes exportar tu lista de contactos fácilmente en formatos **JSON** o **CSV** usando los botones del menú superior o los accesos directos:";
      botResponse.extraHTML = `
        <div style="display: flex; gap: 6px; margin-top: 8px;">
          <button class="thifi-action-btn" data-thifi-action="export-csv">📥 Exportar CSV</button>
          <button class="thifi-action-btn" data-thifi-action="export-json">📄 Exportar JSON</button>
        </div>
      `;
    } else if (textLower.includes('nuevo') || textLower.includes('crear contacto') || textLower.includes('añadir')) {
      botResponse.text = "Para agregar un nuevo contacto, puedes presionar el botón **'Nuevo Contacto'** o usar este acceso directo:";
      botResponse.extraHTML = `
        <button class="thifi-action-btn" data-thifi-action="open-add-modal" style="margin-top: 8px;">➕ Abrir Formulario de Nuevo Contacto</button>
      `;
    } else if (textLower.includes('tema') || textLower.includes('oscuro') || textLower.includes('claro')) {
      botResponse.text = "La agenda cuenta con temas Claro y Oscuro con diseño Glassmorphism. Puedes cambiar el tema con el botón del sol/luna arriba o desde aquí:";
      botResponse.extraHTML = `
        <button class="thifi-action-btn" data-thifi-action="toggle-theme" style="margin-top: 8px;">🎨 Cambiar Tema Claro/Oscuro</button>
      `;
    }
    // 6. Conversational / General AI Responses
    else if (textLower.includes('hola') || textLower.includes('buenas') || textLower.includes('saludos')) {
      botResponse.text = "¡Hola! 😊 ¿Cómo puedo ayudarte hoy con tu agenda o tus contactos?";
    } else if (textLower.includes('gracias') || textLower.includes('excelente') || textLower.includes('genial')) {
      botResponse.text = "¡De nada! 💖 Estoy siempre aquí para ayudarte. Si necesitas algo más, solo pregúntame.";
    } else {
      botResponse.text = `Entendido. He analizado tu consulta sobre *"${userText}"*. 🤖\n\nPuedo realizar búsquedas de contactos, gestionar tickets de soporte técnico o ayudarte a usar la agenda. ¿Deseas hacer una búsqueda o abrir un ticket de soporte?`;
      botResponse.extraHTML = `
        <div style="display: flex; gap: 6px; margin-top: 8px;">
          <button class="thifi-action-btn" data-thifi-action="prompt" data-thifi-value="Buscar contacto">🔍 Buscar contacto</button>
          <button class="thifi-action-btn" data-thifi-action="prompt" data-thifi-value="Crear ticket de soporte">🎫 Crear soporte</button>
        </div>
      `;
    }

    this.messages.push(botResponse);
    this.saveMessages();
    this.renderMessage(botResponse);
    this.scrollToBottom();
  }

  handleSearchIntent(textLower, botResponse) {
    const query = textLower
      .replace(/busca|buscar|encuentra|encontrar|quien es|quién es|teléfono|telefono|contacto|contactos|dame|a|el|de|un|una|los|las/gi, '')
      .trim();

    let matches = [];
    if (query.length > 0) {
      matches = this.app.contacts.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        c.category.toLowerCase().includes(query) ||
        (c.notes && c.notes.toLowerCase().includes(query))
      );
    } else {
      matches = this.app.contacts;
    }

    if (matches.length === 0) {
      botResponse.text = `No encontré ningún contacto en tu agenda que coincida con **"${query}"**. 🔍\n\n¿Deseas agregar a esta persona a tu agenda?`;
      botResponse.extraHTML = `
        <button class="thifi-action-btn" data-thifi-action="open-add-modal" style="margin-top: 8px;">➕ Crear Nuevo Contacto</button>
      `;
    } else {
      botResponse.text = `Encontré **${matches.length}** resultado(s) en tu agenda:`;
      botResponse.extraHTML = matches.map(c => this.buildContactCardHTML(c)).join('');
    }
  }

  buildContactCardHTML(c) {
    return `
      <div class="thifi-contact-card">
        <div class="thifi-contact-header">
          <span class="thifi-contact-name">${c.favorite ? '⭐ ' : ''}${this.app.escapeHTML(c.name)}</span>
          <span class="thifi-contact-badge">${this.app.escapeHTML(c.category)}</span>
        </div>
        <div class="thifi-contact-info">
          <div>📞 <strong>${this.app.escapeHTML(c.phone)}</strong></div>
          ${c.email ? `<div>✉️ ${this.app.escapeHTML(c.email)}</div>` : ''}
          ${c.notes ? `<div>📝 ${this.app.escapeHTML(c.notes)}</div>` : ''}
        </div>
        <div class="thifi-contact-actions">
          <button class="thifi-action-btn" data-thifi-action="filter-search" data-thifi-value="${this.app.escapeHTML(c.name)}">🔍 Ver en agenda</button>
          <button class="thifi-action-btn" data-thifi-action="copy-phone" data-thifi-value="${this.app.escapeHTML(c.phone)}">📋 Copiar tel</button>
        </div>
      </div>
    `;
  }

  submitSupportTicket(subject, desc, priority) {
    const ticketId = 'TICK-' + Math.floor(1000 + Math.random() * 9000);
    const newTicket = {
      id: ticketId,
      subject: subject,
      desc: desc,
      priority: priority,
      status: 'En Revisión ⏳',
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    };

    this.tickets.unshift(newTicket);
    localStorage.setItem('app_support_tickets', JSON.stringify(this.tickets));

    const confirmationMsg = {
      id: Date.now(),
      sender: 'bot',
      text: `¡Ticket de soporte creado con éxito! 🎉\n\nReferencia del ticket: **${ticketId}**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      extraHTML: `
        <div class="thifi-ticket-card">
          <span class="thifi-ticket-badge">ESTADO: EN REVISIÓN ⏳</span>
          <div style="font-weight: 700; color: var(--text-primary); margin: 2px 0;">[${ticketId}] ${this.app.escapeHTML(subject)}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${this.app.escapeHTML(desc)}</div>
          <div style="font-size: 0.7rem; opacity: 0.7; margin-top: 4px;">Prioridad: ${priority} • Generado con IA THIFI</div>
        </div>
      `
    };

    this.messages.push(confirmationMsg);
    this.saveMessages();
    this.renderMessage(confirmationMsg);
    this.scrollToBottom();

    this.app.showToast(`Ticket de soporte ${ticketId} registrado`, 'success');
  }

  handleChatAction(action, value) {
    if (action === 'filter-search' && value) {
      this.app.searchInput.value = value;
      this.app.searchTerm = value;
      this.app.render();
      this.app.showToast(`Filtrando por "${value}"`, 'info');
    } else if (action === 'copy-phone' && value) {
      navigator.clipboard.writeText(value).then(() => {
        this.app.showToast(`Teléfono ${value} copiado`, 'success');
      }).catch(() => {
        this.app.showToast(`Teléfono: ${value}`, 'info');
      });
    } else if (action === 'open-add-modal') {
      this.app.openAddContactModal();
    } else if (action === 'export-csv') {
      this.app.exportCSV();
    } else if (action === 'export-json') {
      this.app.exportJSON();
    } else if (action === 'toggle-theme') {
      const newTheme = this.app.theme === 'dark' ? 'light' : 'dark';
      this.app.applyTheme(newTheme);
      this.app.showToast(`Tema cambiado a ${newTheme}`, 'info');
    } else if (action === 'prompt' && value) {
      this.handleUserInput(value);
    }
  }

  renderMessage(msgObj) {
    const isUser = msgObj.sender === 'user';
    const msgDiv = document.createElement('div');
    msgDiv.className = `thifi-msg ${isUser ? 'thifi-msg-user' : 'thifi-msg-bot'}`;

    let parsedText = this.app.escapeHTML(msgObj.text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
      <div class="thifi-msg-avatar">
        ${isUser ? '👤' : '✨'}
      </div>
      <div class="thifi-msg-content">
        <div>${parsedText}</div>
        ${msgObj.extraHTML || ''}
        <span class="thifi-msg-time">${msgObj.timestamp}</span>
      </div>
    `;

    this.messagesContainer.appendChild(msgDiv);
  }

  showTyping(show) {
    this.isTyping = show;
    if (show) {
      this.typingIndicator.classList.remove('hidden');
    } else {
      this.typingIndicator.classList.add('hidden');
    }
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 50);
  }

  clearChat() {
    if (confirm('¿Deseas borrar el historial de conversación con THIFI?')) {
      this.messages = [];
      localStorage.removeItem('thifi_chat_history');
      this.messagesContainer.innerHTML = '';
      this.addWelcomeMessage();
      this.app.showToast('Historial de chat limpiado', 'info');
    }
  }

  saveMessages() {
    localStorage.setItem('thifi_chat_history', JSON.stringify(this.messages));
  }
}

// ==========================================================================
//  I18n - Internationalization Manager (ES / EN)
// ==========================================================================
const TRANSLATIONS = {
  es: {
    // Header & title
    appTitle: 'Gestor de Contactos',
    appSubtitle: 'Organiza, busca y administra tus contactos en un solo lugar',
    statsTitle: 'Total de contactos',
    langTitle: 'Desactivado: Español | Activo: English',
    themeTitleDark: 'Cambiar tema claro/oscuro',
    exportMenuTitle: 'Opciones de exportación',
    exportBtn: 'Exportar',
    exportJson: 'Exportar como JSON',
    exportCsv: 'Exportar como CSV',
    newContact: 'Nuevo Contacto',
    // Search & filters
    searchPlaceholder: 'Buscar por nombre, teléfono o email...',
    clearSearch: 'Limpiar búsqueda',
    catAll: 'Todos',
    catFavorite: '⭐ Favoritos',
    catTrabajo: '💼 Trabajos',
    catFamilia: '🏠 Familias',
    catAmigos: '🎉 Amigos',
    catOtros: '📌 Generales',
    sortNameAsc: 'Nombre (A-Z)',
    sortNameDesc: 'Nombre (Z-A)',
    sortNewest: 'Más recientes primero',
    sortOldest: 'Más antiguos primero',
    viewGridTitle: 'Vista Cuadrícula',
    viewListTitle: 'Vista Lista',
    // Empty state
    emptyTitle: 'Sin contactos encontrados',
    emptyDesc: 'No hay ningún contacto que coincida con tus criterios de búsqueda.',
    btnResetFilters: 'Restablecer Filtros',
    btnLoadDemo: 'Cargar Contactos de Prueba',
    // Contact modal
    modalTitleNew: 'Nuevo Contacto',
    modalTitleEdit: 'Editar Contacto',
    labelName: 'Nombre Completo',
    namePlaceholder: 'Ej: Ana María García',
    labelPhone: 'Teléfono',
    phonePlaceholder: 'Ej: +34 612 345 678',
    labelEmail: 'Correo Electrónico',
    emailPlaceholder: 'Ej: ana.garcia@email.com',
    labelCategory: 'Categoría',
    optTrabajo: '💼 Trabajo',
    optFamilia: '🏠 Familia',
    optAmigos: '🎉 Amigos',
    optOtros: '📌 General',
    labelFavorite: '⭐ Marcar como Favorito',
    labelNotes: 'Notas adicionales (Opcional)',
    notesPlaceholder: 'Información de contacto, empresa, cumpleaños, etc.',
    btnCancel: 'Cancelar',
    btnSaveNew: 'Guardar Contacto',
    btnSaveEdit: 'Actualizar Contacto',
    // Delete modal
    deleteTitle: '¿Eliminar contacto?',
    deleteBodyPrefix: '¿Estás seguro de que deseas eliminar a',
    deleteBodySuffix: '?',
    deleteSubtle: 'Podrás deshacer esta acción durante unos segundos desde la notificación inferior.',
    btnDeleteConfirm: 'Eliminar',
    // THIFI widget
    thifiTriggerTitle: 'THIFI - Asistente con IA',
    thifiTrigger: 'Habla con THIFI ✨',
    thifiAiTag: 'IA Soporte',
    thifiSubtitle: 'Asistente Virtual de tu Agenda',
    thifiClearTitle: 'Limpiar conversación',
    thifiCloseTitle: 'Minimizar chat',
    thifiChipSearch: '🔍 Buscar contacto',
    thifiChipSupport: '🎫 Crear soporte',
    thifiChipFavorites: '⭐ Mis Favoritos',
    thifiChipTickets: '📋 Mis Tickets',
    thifiChipHelp: '❓ Ayuda',
    thifiTyping: 'THIFI está escribiendo...',
    thifiPlaceholder: 'Pregúntame algo o busca un contacto...',
    thifiSendTitle: 'Enviar mensaje',
    // Toast / validation messages
    toastAdded: 'agregado a favoritos',
    toastRemoved: 'Quitado de favoritos',
    toastSaved: 'guardado',
    toastUpdated: 'actualizado',
    toastDeleted: 'eliminado',
    toastRestored: 'Restablecido',
    toastDemoLoaded: 'Contactos de prueba cargados correctamente',
    toastNoExport: 'No hay contactos para exportar',
    toastExportedJson: 'Contactos exportados a JSON',
    toastExportedCsv: 'Contactos exportados a CSV',
    // Validation
    validName: 'El nombre es obligatorio.',
    validPhone: 'El teléfono es obligatorio.',
    // Empty states dynamic
    emptyAgendaTitle: '¡Tu agenda está vacía!',
    emptyAgendaDesc: 'Añade tu primer contacto o carga los datos de prueba.',
    emptySearchTitle: 'Sin resultados',
    emptySearchDesc: 'No se encontraron contactos que coincidan con la búsqueda o filtro actual.',
    // Star titles
    starAdd: 'Marcar favorito',
    starRemove: 'Quitar de favoritos',
    // Card action titles
    cardPhone: 'Teléfono',
    cardEmail: 'Correo electrónico',
    cardCall: 'Llamar',
    cardMail: 'Enviar correo',
    cardWhatsApp: 'Enviar WhatsApp',
    cardEdit: 'Editar contacto',
    cardDelete: 'Eliminar contacto',
  },
  en: {
    // Header & title
    appTitle: 'Contact Manager',
    appSubtitle: 'Organize, search and manage your contacts in one place',
    statsTitle: 'Total contacts',
    langTitle: 'Active: English | Inactive: Español',
    themeTitleDark: 'Toggle light/dark theme',
    exportMenuTitle: 'Export options',
    exportBtn: 'Export',
    exportJson: 'Export as JSON',
    exportCsv: 'Export as CSV',
    newContact: 'New Contact',
    // Search & filters
    searchPlaceholder: 'Search by name, phone or email...',
    clearSearch: 'Clear search',
    catAll: 'All',
    catFavorite: '⭐ Favorites',
    catTrabajo: '💼 Work',
    catFamilia: '🏠 Family',
    catAmigos: '🎉 Friends',
    catOtros: '📌 General',
    sortNameAsc: 'Name (A-Z)',
    sortNameDesc: 'Name (Z-A)',
    sortNewest: 'Newest first',
    sortOldest: 'Oldest first',
    viewGridTitle: 'Grid View',
    viewListTitle: 'List View',
    // Empty state
    emptyTitle: 'No contacts found',
    emptyDesc: 'No contacts match your current search criteria.',
    btnResetFilters: 'Reset Filters',
    btnLoadDemo: 'Load Sample Contacts',
    // Contact modal
    modalTitleNew: 'New Contact',
    modalTitleEdit: 'Edit Contact',
    labelName: 'Full Name',
    namePlaceholder: 'e.g.: John Smith',
    labelPhone: 'Phone',
    phonePlaceholder: 'e.g.: +1 555 123 4567',
    labelEmail: 'Email Address',
    emailPlaceholder: 'e.g.: john.smith@email.com',
    labelCategory: 'Category',
    optTrabajo: '💼 Work',
    optFamilia: '🏠 Family',
    optAmigos: '🎉 Friends',
    optOtros: '📌 General',
    labelFavorite: '⭐ Mark as Favorite',
    labelNotes: 'Additional Notes (Optional)',
    notesPlaceholder: 'Company, birthday, additional info, etc.',
    btnCancel: 'Cancel',
    btnSaveNew: 'Save Contact',
    btnSaveEdit: 'Update Contact',
    // Delete modal
    deleteTitle: 'Delete contact?',
    deleteBodyPrefix: 'Are you sure you want to delete',
    deleteBodySuffix: '?',
    deleteSubtle: 'You can undo this action for a few seconds from the notification below.',
    btnDeleteConfirm: 'Delete',
    // THIFI widget
    thifiTriggerTitle: 'THIFI - AI Assistant',
    thifiTrigger: 'Chat with THIFI ✨',
    thifiAiTag: 'AI Support',
    thifiSubtitle: 'Your Virtual Contact Book Assistant',
    thifiClearTitle: 'Clear conversation',
    thifiCloseTitle: 'Minimize chat',
    thifiChipSearch: '🔍 Search contact',
    thifiChipSupport: '🎫 Create support',
    thifiChipFavorites: '⭐ My Favorites',
    thifiChipTickets: '📋 My Tickets',
    thifiChipHelp: '❓ Help',
    thifiTyping: 'THIFI is typing...',
    thifiPlaceholder: 'Ask me something or search a contact...',
    thifiSendTitle: 'Send message',
    // Toast / validation messages
    toastAdded: 'added to favorites',
    toastRemoved: 'Removed from favorites',
    toastSaved: 'saved',
    toastUpdated: 'updated',
    toastDeleted: 'deleted',
    toastRestored: 'Restored',
    toastDemoLoaded: 'Sample contacts loaded successfully',
    toastNoExport: 'No contacts to export',
    toastExportedJson: 'Contacts exported as JSON',
    toastExportedCsv: 'Contacts exported as CSV',
    // Validation
    validName: 'Name is required.',
    validPhone: 'Phone number is required.',
    // Empty states dynamic
    emptyAgendaTitle: 'Your contact book is empty!',
    emptyAgendaDesc: 'Add your first contact or load the sample data.',
    emptySearchTitle: 'No results',
    emptySearchDesc: 'No contacts found matching the current search or filter.',
    // Star titles
    starAdd: 'Mark as favorite',
    starRemove: 'Remove from favorites',
    // Card action titles
    cardPhone: 'Phone',
    cardEmail: 'Email address',
    cardCall: 'Call',
    cardMail: 'Send email',
    cardWhatsApp: 'Send WhatsApp',
    cardEdit: 'Edit contact',
    cardDelete: 'Delete contact',
  }
};

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('app_lang') || 'es';
    this.btnLangToggle = document.getElementById('btn-lang-toggle');
    this.bindEvents();
    this.apply(this.currentLang);
  }

  bindEvents() {
    if (this.btnLangToggle) {
      this.btnLangToggle.addEventListener('click', () => {
        const next = this.currentLang === 'es' ? 'en' : 'es';
        this.apply(next);
      });
    }
  }

  t(key) {
    return TRANSLATIONS[this.currentLang][key] || TRANSLATIONS['es'][key] || key;
  }

  apply(lang) {
    this.currentLang = lang;
    localStorage.setItem('app_lang', lang);

    // Toggle button visual state: class 'active' = EN selected
    if (this.btnLangToggle) {
      this.btnLangToggle.classList.toggle('active', lang === 'en');
    }

    const dict = TRANSLATIONS[lang];

    // 1. Update elements with data-i18n (text content)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    // 2. Update elements with data-i18n-placeholder (input/textarea placeholders)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) {
        el.placeholder = dict[key];
      }
    });

    // 3. Update elements with data-i18n-title (title attributes)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key] !== undefined) {
        el.title = dict[key];
      }
    });

    // 4. Update <html lang> attribute for accessibility
    document.documentElement.lang = lang;

    // 5. Re-render contact cards so dynamic content (titles, card texts) also updates
    if (window.contactApp) {
      window.contactApp.currentLang = lang;
      window.contactApp.render();
    }
  }
}

// ==========================================================================
//  AuthManager - Authentication Logic (Phone: 70920716)
// ==========================================================================
class AuthManager {
  constructor() {
    this.validPhone = '70920716';
    
    // DOM Elements
    this.loginScreen = document.getElementById('login-screen');
    this.mainApp = document.getElementById('main-app');
    this.loginForm = document.getElementById('login-form');
    this.phoneInput = document.getElementById('login-phone');
    this.passwordInput = document.getElementById('login-password');
    this.phoneError = document.getElementById('login-phone-error');
    this.pwError = document.getElementById('login-pw-error');
    this.btnTogglePw = document.getElementById('btn-toggle-login-pw');
    this.pwEyeIcon = document.getElementById('pw-eye-login');
    this.btnLogout = document.getElementById('btn-logout');
    this.sessionPhoneDisplay = document.getElementById('session-phone-display');

    this.init();
  }

  init() {
    this.bindEvents();
    this.checkSession();
  }

  bindEvents() {
    // Submit Login Form
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Toggle password visibility
    if (this.btnTogglePw) {
      this.btnTogglePw.addEventListener('click', () => {
        const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.passwordInput.setAttribute('type', type);
      });
    }

    // Logout
    if (this.btnLogout) {
      this.btnLogout.addEventListener('click', () => {
        this.logout();
      });
    }

    // Clear errors on input
    if (this.phoneInput) {
      this.phoneInput.addEventListener('input', () => {
        if (this.phoneError) this.phoneError.textContent = '';
      });
    }
    if (this.passwordInput) {
      this.passwordInput.addEventListener('input', () => {
        if (this.pwError) this.pwError.textContent = '';
      });
    }
  }

  handleLogin() {
    const rawPhone = this.phoneInput.value.trim();
    const cleanPhone = rawPhone.replace(/\D/g, ''); // limpia espacios, guiones o signos +
    const password = this.passwordInput.value.trim();

    let hasError = false;

    // Validar teléfono
    if (!rawPhone) {
      this.phoneError.textContent = 'Ingresa tu número de teléfono.';
      hasError = true;
    } else if (cleanPhone !== this.validPhone && rawPhone !== this.validPhone) {
      this.phoneError.textContent = 'Número de teléfono incorrecto.';
      hasError = true;
    }

    // Validar contraseña
    if (!password) {
      this.pwError.textContent = 'Ingresa tu contraseña.';
      hasError = true;
    } else if (password.length < 4) {
      this.pwError.textContent = 'La contraseña debe tener al menos 4 caracteres.';
      hasError = true;
    }

    if (hasError) return;

    // Guardar sesión
    const userSession = {
      phone: rawPhone,
      loggedInAt: Date.now()
    };
    localStorage.setItem('app_session', JSON.stringify(userSession));

    this.showApp(rawPhone);
    if (window.contactApp) {
      window.contactApp.showToast('¡Sesión iniciada correctamente! 👋', 'success');
    }
  }

  checkSession() {
    const session = localStorage.getItem('app_session');
    if (session) {
      try {
        const data = JSON.parse(session);
        if (data && data.phone) {
          this.showApp(data.phone);
          return;
        }
      } catch (e) {
        localStorage.removeItem('app_session');
      }
    }
    this.showLogin();
  }

  showApp(phone) {
    if (this.loginScreen) this.loginScreen.classList.add('hidden');
    if (this.mainApp) this.mainApp.classList.remove('hidden');
    if (this.sessionPhoneDisplay) {
      const maskedPhone = phone.length > 4 
        ? phone.slice(0, 2) + '****' + phone.slice(-2) 
        : '••••••••';
      this.sessionPhoneDisplay.textContent = `📱 ${maskedPhone}`;
    }
  }

  showLogin() {
    if (this.loginScreen) this.loginScreen.classList.remove('hidden');
    if (this.mainApp) this.mainApp.classList.add('hidden');
    if (this.loginForm) this.loginForm.reset();
  }

  logout() {
    localStorage.removeItem('app_session');
    this.showLogin();
    if (window.contactApp) {
      window.contactApp.showToast('Sesión cerrada', 'info');
    }
  }
}

// Initialize Application when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
  window.i18n = new I18nManager();
  window.contactApp = new ContactApp();
  window.thifiAssistant = new ThifiAssistant(window.contactApp);

  // Re-apply translations after app initializes (so dynamic renders are translated)
  window.i18n.apply(window.i18n.currentLang);
});

