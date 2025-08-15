// Basic client-intake prototype (no backend).
// - Validates inputs
// - Saves data to localStorage
// - Generates a ticket id
// - Prefills a WhatsApp message
(function () {
  const form = document.getElementById('intakeForm');
  const success = document.getElementById('success');
  const ticketEl = document.getElementById('ticketId');
  const otherDocWrap = document.getElementById('otherDocWrap');
  const yearEl = document.getElementById('year');
  const sendOnWhatsAppBtn = document.getElementById('sendOnWhatsApp');

  yearEl.textContent = new Date().getFullYear();

  // Toggle "Other" document description
  form.docType.addEventListener('change', () => {
    otherDocWrap.classList.toggle('hidden', form.docType.value !== 'Other');
  });

  function showError(input, msg) {
    const field = input.closest('.field, .checkbox');
    const err = field.querySelector('.error');
    if (err) err.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    const field = input.closest('.field, .checkbox');
    const err = field.querySelector('.error');
    if (err) err.textContent = '';
    input.removeAttribute('aria-invalid');
  }

  function validate() {
    let valid = true;
    const requiredFields = ['fullName','phone','docType','fromLang','toLang','pages','deadline'];
    requiredFields.forEach(name => {
      const el = form.elements[name];
      if (!el) return;
      let ok = !!el.value;
      if (el.type === 'number') ok = parseInt(el.value, 10) > 0;
      if (!ok) { showError(el, 'This field is required.'); valid = false; }
      else clearError(el);
    });

    // Translation type radios
    const tType = form.querySelector('input[name="tType"]:checked');
    if (!tType) { showError(form.querySelector('input[name="tType"]').closest('.field').querySelector('input[name="tType"]'), 'Please select a type.'); valid = false; }
    else clearError(form.querySelector('input[name="tType"]').closest('.field').querySelector('input[name="tType"]'));

    // Consent
    if (!form.consent.checked) { showError(form.consent, 'You must agree.'); valid = false; }
    else clearError(form.consent);

    // Files
    if (!form.files.files || form.files.files.length === 0) {
      showError(form.files, 'Please add at least one file.'); valid = false;
    } else {
      // Check size <= 50MB each
      const max = 50 * 1024 * 1024;
      for (const f of form.files.files) {
        if (f.size > max) {
          showError(form.files, `File "${f.name}" exceeds 50MB.`);
          valid = false; break;
        }
      }
      if (valid) clearError(form.files);
    }

    // Basic phone check
    const phone = form.phone.value.trim();
    if (!/^\+?\d{8,15}$/.test(phone)) {
      showError(form.phone, 'Enter a valid phone number with country code.');
      valid = false;
    }

    // Email optional
    if (form.email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value)) {
      showError(form.email, 'Enter a valid email address.');
      valid = false;
    }

    return valid;
  }

  function genTicketId() {
    const d = new Date();
    const ymd = d.toISOString().slice(0,10).replace(/-/g,'');
    const rand = Math.random().toString(36).slice(2,6).toUpperCase();
    return `${ymd}-${rand}`;
  }

  function saveLocal(ticketId, data) {
    const key = 'dam_tickets';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    current.push({ ticketId, ...data, createdAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(current));
  }

  function buildWhatsAppText(data, ticketId) {
    const lines = [
      `Hello, I submitted a translation request.`,
      `Ticket: ${ticketId}`,
      `Name: ${data.fullName}`,
      `Phone: ${data.phone}`,
      data.email ? `Email: ${data.email}` : null,
      `Document: ${data.docType}${data.docOther ? ' — ' + data.docOther : ''}`,
      `From → To: ${data.fromLang} → ${data.toLang}`,
      `Type: ${data.tType}`,
      data.authority ? `Authority: ${data.authority}` : null,
      `Pages: ${data.pages}`,
      `Deadline: ${data.deadline}`,
      data.notes ? `Notes: ${data.notes}` : null
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    // Files are not persisted in LS (no backend) — only names for preview
    const fileNames = Array.from(form.files.files).map(f => f.name);
    data.fileNames = fileNames;

    const ticketId = genTicketId();
    saveLocal(ticketId, data);

    ticketEl.textContent = ticketId;
    success.classList.remove('hidden');
    success.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Optional: clear form
    form.reset();
    otherDocWrap.classList.add('hidden');
  });

  sendOnWhatsAppBtn.addEventListener('click', () => {
    // Build a WhatsApp message even before submit (soft validation)
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.fullName || !data.phone || !data.docType || !data.fromLang || !data.toLang || !data.deadline) {
      alert('Please fill at least Name, Phone, Document, From/To, and Deadline to compose the WhatsApp message.');
      return;
    }
    const tempTicket = genTicketId();
    const text = buildWhatsAppText(data, tempTicket);
    const url = (window.BRAND && window.BRAND.waLink) ? window.BRAND.waLink.split('?')[0] : 'https://wa.me/971561234567';
    window.open(`${url}?text=${text}`, '_blank', 'noopener');
  });
})();
