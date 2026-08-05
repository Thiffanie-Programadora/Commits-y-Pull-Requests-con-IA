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
      this.showToast('Contactos de prueba cargados correctamente', 'success');
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

      if (this.contacts.length === 0) {
        this.emptyTitle.textContent = '¡Tu agenda está vacía!';
        this.emptyDesc.textContent = 'Añade tu primer contacto o carga los datos de prueba.';
        this.btnResetFilters.classList.add('hidden');
        this.btnLoadDemo.classList.remove('hidden');
      } else {
        this.emptyTitle.textContent = 'Sin resultados';
        this.emptyDesc.textContent = 'No se encontraron contactos que coincidan con la búsqueda o filtro actual.';
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

    card.innerHTML = `
      <div class="card-header">
        <div class="avatar" style="background: ${avatarBg}">${initials}</div>
        <div class="info">
          <div class="info-name-row">
            <h3 class="contact-name" title="${this.escapeHTML(contact.name)}">${this.escapeHTML(contact.name)}</h3>
            <button class="btn-star ${contact.favorite ? 'active' : ''}" title="${contact.favorite ? 'Quitar de favoritos' : 'Marcar favorito'}" data-action="toggle-star">
              ★
            </button>
          </div>
          <span class="category-badge ${contact.category}">${contact.category}</span>
        </div>
      </div>

      <div class="card-details">
        <div class="detail-item" title="Teléfono">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>${this.escapeHTML(contact.phone)}</span>
        </div>

        ${contact.email ? `
        <div class="detail-item" title="Correo electrónico">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span>${this.escapeHTML(contact.email)}</span>
        </div>
        ` : ''}

        ${contact.notes ? `<p class="contact-notes" title="${this.escapeHTML(contact.notes)}">${this.escapeHTML(contact.notes)}</p>` : ''}
      </div>

      <div class="card-actions">
        <div class="quick-communication">
          <a href="tel:${cleanPhone}" class="action-icon-btn" title="Llamar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </a>
          ${contact.email ? `
          <a href="mailto:${contact.email}" class="action-icon-btn" title="Enviar correo">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
          ` : ''}
          <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="action-icon-btn whatsapp" title="Enviar WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </a>
        </div>

        <div class="card-manage-btns">
          <button class="btn-card-edit" title="Editar contacto" data-action="edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </button>
          <button class="btn-card-delete" title="Eliminar contacto" data-action="delete">
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
      this.showToast(contact.favorite ? `⭐ ${contact.name} agregado a favoritos` : `Quitado de favoritos`, 'success');
    }
  }

  // Modal Handlers
  openContactModal(contactToEdit = null) {
    this.contactForm.reset();
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

    if (contactToEdit) {
      this.modalTitle.textContent = 'Editar Contacto';
      this.contactIdInput.value = contactToEdit.id;
      this.nameInput.value = contactToEdit.name;
      this.phoneInput.value = contactToEdit.phone;
      this.emailInput.value = contactToEdit.email || '';
      this.categorySelect.value = contactToEdit.category || 'Otros';
      this.favoriteInput.checked = contactToEdit.favorite || false;
      this.notesInput.value = contactToEdit.notes || '';
    } else {
      this.modalTitle.textContent = 'Nuevo Contacto';
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

    // Basic Validation
    if (!name) {
      document.getElementById('name-error').textContent = 'El nombre es obligatorio.';
      return;
    }

    if (!phone) {
      document.getElementById('phone-error').textContent = 'El teléfono es obligatorio.';
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
        this.showToast(`Contacto "${name}" actualizado`, 'success');
      }
    } else {
      // Create new contact
      const newContact = {
        id: 'contact-' + Date.now(),
        name, phone, email, category, favorite, notes,
        createdAt: Date.now()
      };
      this.contacts.unshift(newContact);
      this.showToast(`Contacto "${name}" guardado`, 'success');
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

      this.showToastWithUndo(`Contacto "${deletedName}" eliminado`);
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
      this.showToast(`Restablecido "${contact.name}"`, 'success');
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
    if (this.contacts.length === 0) {
      this.showToast('No hay contactos para exportar', 'error');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.contacts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `contactos_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast('Contactos exportados a JSON', 'success');
  }

  exportContactsCSV() {
    if (this.contacts.length === 0) {
      this.showToast('No hay contactos para exportar', 'error');
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
    this.showToast('Contactos exportados a CSV', 'success');
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

// Initialize Application when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.contactApp = new ContactApp();
});
