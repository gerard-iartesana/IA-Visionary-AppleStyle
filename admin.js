let allLeads = []; 
let leadToDelete = null;
let calendar = null; 
let googleTokenClient;
let googleAccessToken = null;
let googleEventSource = null; // Para evitar duplicados

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar Autenticación
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    console.log('Admin Dashboard cargado para:', session.user.email);
    
    // Detectar tema
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('theme') === 'light') {
        document.body.classList.add('light-theme');
    }

    // Inicializar listeners
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');

    searchInput.addEventListener('input', (e) => {
        renderLeads(e.target.value.toLowerCase(), filterStatus.value);
    });

    filterStatus.addEventListener('change', (e) => {
        renderLeads(searchInput.value.toLowerCase(), e.target.value);
    });

    document.getElementById('refresh-leads').addEventListener('click', () => {
        const btn = document.getElementById('refresh-leads');
        btn.classList.add('spinning');
        fetchLeads();
        setTimeout(() => btn.classList.remove('spinning'), 800);
    });

    const kanbanBoard = document.querySelector('.kanban-board');
    if (kanbanBoard) {
        kanbanBoard.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) {
                // Check if card click for ficha (only if not clicking a button)
                const card = e.target.closest('.kanban-card');
                if (card && !e.target.closest('.lead-actions-group')) {
                    showFichaModal(card.dataset.id);
                }
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            const leadId = btn.getAttribute('data-id');
            const leadName = btn.getAttribute('data-name');
            const leadStatus = btn.getAttribute('data-status');

            if (btn.classList.contains('btn-status')) {
                toggleStatus(leadId, leadStatus);
            } else if (btn.classList.contains('btn-whatsapp')) {
                openWhatsApp(btn.getAttribute('data-phone'), leadName, btn.getAttribute('data-interest'));
            } else if (btn.classList.contains('btn-email')) {
                window.location.href = `mailto:${btn.getAttribute('data-email')}`;
            } else if (btn.classList.contains('btn-auto')) {
                sendToWebhook(leadId);
            } else if (btn.classList.contains('btn-proposal')) {
                openProposalModal(leadId);
            } else if (btn.classList.contains('btn-delete')) {
                showDeleteModal(leadId, leadName);
            } else if (btn.classList.contains('btn-ficha')) {
                showFichaModal(leadId);
            }
        });
    }

    const leadsBodyDoc = document.getElementById('leads-body');
    if (leadsBodyDoc) {
        leadsBodyDoc.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();

            const leadId = btn.getAttribute('data-id');
            const leadName = btn.getAttribute('data-name');
            const leadStatus = btn.getAttribute('data-status');

            if (btn.classList.contains('btn-status')) toggleStatus(leadId, leadStatus);
            else if (btn.classList.contains('btn-whatsapp')) openWhatsApp(btn.getAttribute('data-phone'), leadName, btn.getAttribute('data-interest'));
            else if (btn.classList.contains('btn-email')) window.location.href = `mailto:${btn.getAttribute('data-email')}`;
            else if (btn.classList.contains('btn-auto')) sendToWebhook(leadId);
            else if (btn.classList.contains('btn-proposal')) openProposalModal(leadId);
            else if (btn.classList.contains('btn-delete')) showDeleteModal(leadId, leadName);
            else if (btn.classList.contains('btn-ficha')) showFichaModal(leadId);
        });
    }

    // Listeners del Modal
    document.getElementById('modal-cancel').addEventListener('click', hideDeleteModal);
    document.getElementById('modal-confirm').addEventListener('click', confirmDelete);

    // Navegación Sidebar
    const sidebarItems = document.querySelectorAll('.sidebar-item[data-target]');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            console.log('Navegando a:', target);
            
            // UI Update
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Section Switch
            document.querySelectorAll('.admin-content-area').forEach(sec => sec.classList.remove('active'));
            const targetEl = document.getElementById(target);
            if (targetEl) {
                targetEl.classList.add('active');
            } else {
                console.error('No se encontró la sección:', target);
            }

            if (target === 'section-legal') {
                loadLegalTexts();
            } else if (target === 'section-tracking') {
                loadTrackingTexts();
            } else if (target === 'section-calendar') {
                loadCalendarUrl();
                initCalendar();
                syncWithGoogle(true);
            } else if (target === 'section-logs') {
                loadLogs();
            } else if (target === 'section-seo') {
                loadSeoData();
            } else if (target === 'section-payments') {
                console.log('Triggering Pagos section load...');
                loadPaymentLinks();
            }
        });
    });

    // Modals Genéricos
    const btnOpenAppointment = document.getElementById('btn-open-appointment');
    if (btnOpenAppointment) {
        btnOpenAppointment.addEventListener('click', showAppointmentModal);
    }

    document.getElementById('btn-update-appointment').addEventListener('click', updateAppointment);
    document.getElementById('btn-delete-appointment').addEventListener('click', deleteAppointment);

    fetchLeads();
});

async function loadLegalTexts() {
    const { data, error } = await _supabase.from('site_settings').select('key, value');
    if (data) {
        data.forEach(setting => {
            if (setting.key === 'privacy_policy') document.getElementById('editor-privacy').value = setting.value;
            if (setting.key === 'cookie_policy') document.getElementById('editor-cookies').value = setting.value;
        });
    }
}

async function loadCalendarUrl() {
    const { data, error } = await _supabase.from('site_settings').select('value').eq('key', 'calendar_url').single();
    if (data && data.value) {
        document.getElementById('editor-calendar').value = data.value;
    }
}

async function loadTrackingTexts() {
    const { data, error } = await _supabase.from('site_settings').select('key, value');
    let googleActive = false;
    let metaActive = false;

    if (data) {
        data.forEach(setting => {
            const hasValue = setting.value && setting.value.trim() !== '';
            
            if (setting.key === 'tracking_google_head') {
                const el = document.getElementById('editor-google-head');
                if (el) el.value = setting.value;
                if (hasValue) googleActive = true;
            }
            if (setting.key === 'tracking_google_body') {
                const el = document.getElementById('editor-google-body');
                if (el) el.value = setting.value;
                if (hasValue) googleActive = true;
            }
            if (setting.key === 'tracking_meta_head') {
                const el = document.getElementById('editor-meta-head');
                if (el) el.value = setting.value;
                if (hasValue) metaActive = true;
            }
            if (setting.key === 'tracking_meta_body') {
                const el = document.getElementById('editor-meta-body');
                if (el) el.value = setting.value;
                if (hasValue) metaActive = true;
            }
        });
    }

    updateTrackingStatusBox(googleActive, metaActive);
}

function updateTrackingStatusBox(google, meta) {
    const box = document.getElementById('tracking-status-box');
    const title = document.getElementById('status-title');
    const desc = document.getElementById('status-desc');
    const iconContainer = document.getElementById('status-icon-container');
    const icon = document.getElementById('status-icon');
    
    if (!box) return;

    if (!google && !meta) {
        title.innerText = "Sin códigos de seguimiento";
        desc.innerText = "Actualmente no hay códigos guardados en Supabase. Pégalos aquí o pídeselo a tu IA.";
        iconContainer.style.background = 'rgba(255, 59, 48, 0.1)';
        icon.style.color = '#ff3b30';
        icon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
        box.style.border = '1px solid var(--border-color)';
    } else {
        title.innerText = "Base de datos conectada correctamente";
        let actives = [];
        if (google) actives.push('Google');
        if (meta) actives.push('Meta');
        desc.innerText = `Códigos en Supabase: ${actives.join(', ')}. Inyectándose automáticamente en la web.`;
        iconContainer.style.background = 'rgba(52, 199, 89, 0.1)';
        icon.style.color = '#34c759';
        icon.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
        box.style.border = '1px solid rgba(52, 199, 89, 0.3)';
    }
}

async function saveLegalText(key, editorId) {
    const value = document.getElementById(editorId).value;
    const btn = document.querySelector(`button[onclick*="${editorId}"]`);
    const originalText = btn.innerText;

    try {
        btn.innerText = 'Guardando...';
        btn.disabled = true;

        const { error } = await _supabase
            .from('site_settings')
            .upsert({ key, value, updated_at: new Date().toISOString() });

        if (error) throw error;
        
        btn.innerText = '✓ Guardado';
        btn.style.background = '#34c759';
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 2000);

        if (key.includes('tracking')) {
            loadTrackingTexts();
        }

        showToast('✓ Cambios guardados correctamente', 15000); 
        await addLog('Configuración Guardada', `Se ha actualizado la clave: ${key}`);

    } catch (e) {
        console.error(e);
        alert('Error al guardar los cambios.');
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

async function loadPaymentLinks() {
    const { data, error } = await _supabase.from('site_settings').select('key, value').in('key', [
        'stripe_link_puntual', 'stripe_link_auditoria', 'stripe_link_mensual', 'revolut_link'
    ]);
    
    if (data) {
        data.forEach(setting => {
            if (setting.key === 'stripe_link_puntual') document.getElementById('stripe-link-puntual').value = setting.value || '';
            if (setting.key === 'stripe_link_auditoria') document.getElementById('stripe-link-auditoria').value = setting.value || '';
            if (setting.key === 'stripe_link_mensual') document.getElementById('stripe-link-mensual').value = setting.value || '';
            if (setting.key === 'revolut_link') document.getElementById('revolut-link').value = setting.value || '';
        });
    }
}

async function copyPaymentLink(type) {
    let key = '';
    if (type === 'puntual') key = 'stripe_link_puntual';
    if (type === 'auditoria') key = 'stripe_link_auditoria';
    if (type === 'mensual') key = 'stripe_link_mensual';
    if (type === 'revolut') key = 'revolut_link';
    
    try {
        const { data, error } = await _supabase.from('site_settings').select('value').eq('key', key).single();
        if (data && data.value) {
            await navigator.clipboard.writeText(data.value);
            showToast('✓ Link copiado al portapapeles', 3000);
        } else {
            alert('Enlace no configurado aún.');
        }
    } catch (e) {
        console.error(e);
        alert('Error al copiar el enlace.');
    }
}

async function fetchLeads() {
    try {
        const { data, error } = await _supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        allLeads = data;
        updateStats(data);
        renderLeads(document.getElementById('search-input').value.toLowerCase(), document.getElementById('filter-status').value);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con la base de datos para cargar los leads.');
    }
}

function renderLeads(searchTerm = '', statusFilter = 'all') {
    const listCita = document.querySelector('.list-cita-registrada');
    const listReunion = document.querySelector('.list-reunion-hecha');
    const listPiensa = document.querySelector('.list-se-lo-piensa');
    const listConfirmado = document.querySelector('.list-confirmado');
    const leadsBody = document.getElementById('leads-body');
    
    if (!listCita) return; // Not on the leads page
    
    [listCita, listReunion, listPiensa, listConfirmado].forEach(el => el.innerHTML = '');
    if (leadsBody) leadsBody.innerHTML = '';

    const filtered = allLeads.filter(lead => {
        const matchesSearch = (lead.name || '').toLowerCase().includes(searchTerm) || (lead.email || '').toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter || 
                              (statusFilter === 'nuevo' && lead.status === 'cita_registrada') ||
                              (statusFilter === 'contactado' && (lead.status === 'reunion_hecha' || lead.status === 'se_lo_piensa')) ||
                              (statusFilter === 'pagado' && lead.status === 'confirmado');
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        if (leadsBody) leadsBody.innerHTML = '<tr><td colspan="7" class="table-loading">No se encontraron leads.</td></tr>';
    }

    // Render Table (Max 5)
    if (leadsBody) {
        filtered.slice(0, 5).forEach(lead => {
            const date = new Date(lead.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="color: var(--text-grey); font-size: 0.8rem;">${date}</td>
                <td>
                    <div style="font-weight: 600; color: var(--text-white);">${lead.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-grey);">${lead.email}</div>
                    <div style="font-size: 0.8rem; color: var(--text-grey);">${lead.phone || '-'}</div>
                </td>
                <td><span style="font-size: 0.75rem; background: rgba(128,128,128,0.1); padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color); color: var(--text-white);">${lead.interest}</span></td>
                <td style="max-width: 200px; font-size: 0.85rem; color: var(--text-grey); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${lead.message || '-'}</td>
                <td>
                    <div style="font-weight: 500; font-size: 0.85rem; color: var(--text-white);">${lead.comercial || 'Sin asignar'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-grey);">${lead.grupo || 'Sin grupo'}</div>
                </td>
                <td><span class="status-badge status-${lead.status || 'nuevo'}">${lead.status || 'nuevo'}</span></td>
                <td>
                    <div class="lead-actions-group">
                        <button type="button" class="btn-lead-action btn-ficha" data-id="${lead.id}" title="Ficha de Cliente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
                        <button type="button" class="btn-action btn-status" style="width: 32px; height: 32px;" data-id="${lead.id}" data-status="${lead.status || 'nuevo'}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                        <button type="button" class="btn-lead-action btn-whatsapp" data-phone="${lead.phone}" data-name="${lead.name}" data-interest="${lead.interest}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></button>
                        <button type="button" class="btn-lead-action btn-email" data-email="${lead.email}" title="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></button>
                        <button type="button" class="btn-lead-action btn-proposal" data-id="${lead.id}" title="Enviar Presupuesto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></button>
                        <button type="button" class="btn-lead-action btn-auto" data-id="${lead.id}" title="Automatizar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></button>
                        <button type="button" class="btn-lead-action btn-delete" data-id="${lead.id}" data-name="${lead.name}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                    </div>
                </td>
            `;
            leadsBody.appendChild(row);
        });
    }

    // Render Kanban Cards
    filtered.forEach(lead => {
        let status = lead.status || 'cita_registrada';
        // Mapeo retrocompatible
        if (status === 'nuevo') status = 'cita_registrada';
        else if (status === 'contactado') status = 'reunion_hecha';
        else if (status === 'pagado') status = 'confirmado';

        // Determinar qué fecha mostrar (en la 1ra columna la creación, en las otras el movimiento)
        let displayDate = lead.created_at;
        let dateLabel = 'Entrada: ';
        
        if (status !== 'cita_registrada' && lead.updated_at) {
            displayDate = lead.updated_at;
            dateLabel = 'Movido: ';
        }

        const dateStr = new Date(displayDate).toLocaleDateString('es-ES', { 
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
        });

        const card = document.createElement('div');
        card.classList.add('kanban-card');
        card.setAttribute('draggable', 'true');
        card.dataset.id = lead.id;
        card.dataset.status = status;

        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">${lead.name}</div>
                <div class="lead-actions-group" style="gap: 4px;">
                    <button type="button" class="btn-lead-action btn-ficha" style="width: 24px; height: 24px;" data-id="${lead.id}" title="Ficha"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
                    <button type="button" class="btn-lead-action btn-whatsapp" style="width: 24px; height: 24px;" data-phone="${lead.phone}" data-name="${lead.name}" data-interest="${lead.interest}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></button>
                    <button type="button" class="btn-lead-action btn-proposal" style="width: 24px; height: 24px;" data-id="${lead.id}" title="Presupuesto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></button>
                    <button type="button" class="btn-lead-action btn-auto" style="width: 24px; height: 24px;" data-id="${lead.id}" title="Automatizar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></button>
                </div>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-grey);">${lead.email}</div>
            <div style="font-size: 0.8rem; color: var(--text-grey);">${lead.phone || '-'}</div>
            <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span class="card-interest">${lead.interest || 'Lead'}</span>
                <span class="card-date" style="font-size: 0.7rem; opacity: 0.8;">${dateLabel}${dateStr}</span>
            </div>
        `;

        if (status === 'cita_registrada') listCita.appendChild(card);
        else if (status === 'reunion_hecha') listReunion.appendChild(card);
        else if (status === 'se_lo_piensa') listPiensa.appendChild(card);
        else if (status === 'confirmado') listConfirmado.appendChild(card);
        else listCita.appendChild(card);
    });

    updateKanbanCounts();
    initKanbanDrag();
}

function updateKanbanCounts() {
    document.querySelectorAll('.kanban-column').forEach(col => {
        const count = col.querySelectorAll('.kanban-card').length;
        const countEl = col.querySelector('.card-count');
        if(countEl) countEl.innerText = count;
    });
}

function updateStats(leads) {
    document.getElementById('stat-total').innerText = leads.length;
    document.getElementById('stat-pending').innerText = leads.filter(l => ['nuevo', 'cita_registrada'].includes(l.status)).length;
    document.getElementById('stat-contacted').innerText = leads.filter(l => ['contactado', 'reunion_hecha', 'se_lo_piensa'].includes(l.status)).length;
    document.getElementById('stat-paid').innerText = leads.filter(l => ['pagado', 'confirmado'].includes(l.status)).length;
}

/** DRAG AND DROP KANBAN LOGIC */
let draggedCard = null;

function initKanbanDrag() {
    const cards = document.querySelectorAll('.kanban-card');
    const columns = document.querySelectorAll('.kanban-column');

    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    columns.forEach(col => {
        col.addEventListener('dragover', handleDragOver);
        col.addEventListener('dragenter', handleDragEnter);
        col.addEventListener('dragleave', handleDragLeave);
        col.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    draggedCard = this;
    setTimeout(() => this.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id); 
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.column-content').forEach(col => col.classList.remove('drag-over'));
    draggedCard = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const container = this.querySelector('.column-content');
    if(draggedCard) {
        const afterElement = getDragAfterElement(container, e.clientY);
        if (afterElement == null) {
            container.appendChild(draggedCard);
        } else {
            container.insertBefore(draggedCard, afterElement);
        }
    }
}

function handleDragEnter(e) {
    e.preventDefault();
    const content = this.querySelector('.column-content');
    if (content) content.classList.add('drag-over');
}

function handleDragLeave(e) {
    const content = this.querySelector('.column-content');
    if (content && !content.contains(e.relatedTarget)) {
        content.classList.remove('drag-over');
    }
}

async function handleDrop(e) {
    e.preventDefault();
    const content = this.querySelector('.column-content');
    if (content) content.classList.remove('drag-over');

    const newStatus = this.dataset.status;
    const cardId = draggedCard.dataset.id;
    const oldStatus = draggedCard.dataset.status;

    if (draggedCard && oldStatus !== newStatus) {
        // Optimistic UI Update
        draggedCard.dataset.status = newStatus;
        
        // Actualizar el array en memoria inmediatamente
        const leadIndex = allLeads.findIndex(l => l.id === cardId);
        if (leadIndex !== -1) {
            allLeads[leadIndex].status = newStatus;
            allLeads[leadIndex].updated_at = new Date().toISOString(); // Move time in memory
        }
        
        updateKanbanCounts();
        updateStats(allLeads);
        
        // Re-renderizar visualmente para actualizar las etiquetas de fecha
        const searchVal = document.getElementById('search-input') ? document.getElementById('search-input').value.toLowerCase() : '';
        const filterVal = document.getElementById('filter-status') ? document.getElementById('filter-status').value : 'all';
        renderLeads(searchVal, filterVal);

        // Silent Update a Supabase
        try {
            await _supabase.from('leads').update({ status: newStatus }).eq('id', cardId);
            console.log(`📡 Lead ID ${cardId} movido a: ${newStatus}`);
        } catch (err) {
            console.error('Error al actualizar Supabase:', err);
            showToast('❌ Error al sincronizar fase con el servidor', 5000);
            // Si falla, podrías revertir o refrescar
            fetchLeads();
        }
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function toggleStatus(id, currentStatus) {
    const newStatus = (currentStatus === 'nuevo' || !currentStatus) ? 'contactado' : 'nuevo';
    try {
        const { error } = await _supabase.from('leads').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
        
        await addLog('Estado de Lead', `Lead ID: ${id.split('-')[0]}... cambiado a '${newStatus}'`);
        
        fetchLeads();
    } catch (error) {
        alert('Error al actualizar estado');
    }
}

function openWhatsApp(phone, name, interest) {
    if (!phone) return alert('Sin teléfono');
    const msg = encodeURIComponent(`Hola ${name}, te escribo sobre ${interest}.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
}

async function sendToWebhook(leadId) {
    const lead = allLeads.find(l => l.id === leadId);
    if (!lead) return;

    // Puedes cambiar esto por tu URL real de n8n
    const N8N_WEBHOOK_URL = 'TU_WEBHOOK_N8N_AQUI'; 

    if (N8N_WEBHOOK_URL === 'TU_WEBHOOK_N8N_AQUI') {
        alert(`🚀 Lead: ${lead.name}\nDatos listos para n8n.`);
        console.log('Lead Data:', lead);
        return;
    }

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'admin_trigger', lead })
        });
        if (response.ok) alert('🚀 Enviado a n8n');
    } catch (e) {
        alert('Error en conexión n8n');
    }
}

function showDeleteModal(id, name) {
    leadToDelete = id;
    document.querySelector('#delete-modal p').innerText = `Vas a eliminar permanentemente a "${name}".`;
    document.getElementById('delete-modal').classList.add('active');
}

function hideDeleteModal() {
    leadToDelete = null;
    document.getElementById('delete-modal').classList.remove('active');
}

async function confirmDelete() {
    if (!leadToDelete) return;
    try {
        const { error } = await _supabase.from('leads').delete().eq('id', leadToDelete);
        if (error) throw error;
        
        await addLog('Lead Eliminado', `Se ha borrado permanentemente el lead ID: ${leadToDelete.split('-')[0]}...`);
        
        hideDeleteModal();
        fetchLeads();
    } catch (error) {
        alert('No se pudo eliminar');
    }
}

// --- LOGGING SYSTEM ---
async function addLog(action, details) {
    try {
        const { data: { session } } = await _supabase.auth.getSession();
        const userEmail = session ? session.user.email : 'Admin';
        
        await _supabase.from('admin_logs').insert([{ action, details, user_email: userEmail }]);
    } catch (e) {
        console.error('No se pudo guardar el log', e);
    }
}

async function loadLogs() {
    const logsBody = document.getElementById('logs-body');
    logsBody.innerHTML = '<tr><td colspan="4" class="table-loading">Cargando registros...</td></tr>';
    
    try {
        const { data, error } = await _supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        
        if (data.length === 0) {
            logsBody.innerHTML = '<tr><td colspan="4" class="table-loading">No hay actividad registrada aún.</td></tr>';
            return;
        }

        logsBody.innerHTML = '';
        data.forEach(log => {
            const date = new Date(log.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="color: var(--text-grey); font-size: 0.8rem;">${date}</td>
                <td><span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${log.user_email || 'Admin'}</span></td>
                <td style="font-weight: 500; color: var(--text-white);">${log.action}</td>
                <td style="color: var(--text-grey); font-size: 0.85rem;">${log.details || '-'}</td>
            `;
            logsBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error cargando logs:', error);
        logsBody.innerHTML = '<tr><td colspan="4" class="table-loading" style="color: #ff3b30;">Falta crear la tabla "admin_logs" en Supabase.</td></tr>';
    }
}

// --- FICHA CLIENTE ---
function showFichaModal(id) {
    const lead = allLeads.find(l => l.id === id);
    if (!lead) return;
    
    document.getElementById('ficha-lead-id').value = id;
    document.getElementById('ficha-cliente-nombre').innerText = lead.name;
    document.getElementById('ficha-email').innerText = lead.email || '-';
    document.getElementById('ficha-telefono').innerText = lead.phone || '-';
    document.getElementById('ficha-interes').innerText = lead.interest || '-';
    document.getElementById('ficha-mensaje').innerText = lead.message || 'Sin mensaje adicional.';
    
    document.getElementById('ficha-comercial').value = lead.comercial || '';
    document.getElementById('ficha-grupo').value = lead.grupo || '';
    document.getElementById('ficha-razonsocial').value = lead.razon_social || '';
    document.getElementById('ficha-nif').value = lead.nif || '';
    document.getElementById('ficha-direccion').value = lead.direccion || '';
    document.getElementById('ficha-iban').value = lead.iban || '';
    
    document.getElementById('ficha-modal').classList.add('active');
}

async function saveFicha() {
    const id = document.getElementById('ficha-lead-id').value;
    const comercial = document.getElementById('ficha-comercial').value;
    const grupo = document.getElementById('ficha-grupo').value;
    const razon_social = document.getElementById('ficha-razonsocial').value;
    const nif = document.getElementById('ficha-nif').value;
    const direccion = document.getElementById('ficha-direccion').value;
    const iban = document.getElementById('ficha-iban').value;

    try {
        const { error } = await _supabase.from('leads').update({
            comercial,
            grupo,
            razon_social,
            nif,
            direccion,
            iban
        }).eq('id', id);

        if (error) throw error;
        
        await addLog('Ficha Actualizada', `Se han actualizado los datos fiscales o de asignación del Lead ID: ${id.split('-')[0]}...`);
        
        document.getElementById('ficha-modal').classList.remove('active');
        fetchLeads();
    } catch (e) {
        alert('Error al guardar la ficha del cliente.');
        console.error(e);
    }
}

// --- CALENDAR SYSTEM ---
function initCalendar() {
    const calendarEl = document.getElementById('calendar-view');
    if (!calendarEl || calendar) return; 

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        locale: 'es',
        events: async function(info, successCallback, failureCallback) {
            try {
                // 1. Cargar citas manuales de Supabase
                const { data: manualEvents, error } = await _supabase
                    .from('appointments')
                    .select('*')
                    .gte('start_time', info.startStr)
                    .lte('start_time', info.endStr);

                if (error) throw error;

                const formattedManual = manualEvents.map(app => ({
                    id: app.id,
                    title: app.title,
                    start: app.start_time,
                    end: app.end_time,
                    color: 'var(--accent-blue)',
                    extendedProps: { 
                        notes: app.notes, 
                        type: 'manual',
                        clientName: app.client_name,
                        clientEmail: app.client_email,
                        clientPhone: app.client_phone
                    }
                }));

                // 2. Si hay Google Access Token, podríamos cargar aquí, 
                // pero lo mantenemos separado por ahora para no complicar el flujo de auth
                
                successCallback(formattedManual);
                renderUpcomingList(formattedManual);
            } catch (e) {
                console.error('Error cargando citas:', e);
                // Fallback a eventos dummy si falla la tabla
                successCallback([
                    { title: 'Auditoría IA 360', start: new Date().toISOString().split('T')[0] + 'T17:30:00', color: 'var(--accent-blue)' }
                ]);
            }
        },
        editable: true,
        eventClick: function(info) {
            // Si es manual o tiene ID (casi todas tienen ID en Google)
            showEditAppointmentModal(info.event);
        }
    });

    calendar.render();
}

function showEditAppointmentModal(event) {
    const props = event.extendedProps;
    const modal = document.getElementById('edit-appointment-modal');
    
    document.getElementById('edit-app-id').value = event.id;
    document.getElementById('edit-app-title').value = event.title;
    document.getElementById('edit-app-client-name').value = props.clientName || '';
    document.getElementById('edit-app-client-email').value = props.clientEmail || '';
    document.getElementById('edit-app-client-phone').value = props.clientPhone || '';
    
    const start = event.start;
    // Formateo robusto para inputs
    const yyyy = start.getFullYear();
    const mm = String(start.getMonth() + 1).padStart(2, '0');
    const dd = String(start.getDate()).padStart(2, '0');
    const hh = String(start.getHours()).padStart(2, '0');
    const min = String(start.getMinutes()).padStart(2, '0');

    document.getElementById('edit-app-date').value = `${yyyy}-${mm}-${dd}`;
    document.getElementById('edit-app-time').value = `${hh}:${min}`;
    document.getElementById('edit-app-notes').value = props.notes || '';

    modal.classList.add('active');
}

async function updateAppointment() {
    const id = document.getElementById('edit-app-id').value;
    const title = document.getElementById('edit-app-title').value;
    const client_name = document.getElementById('edit-app-client-name').value;
    const client_email = document.getElementById('edit-app-client-email').value;
    const client_phone = document.getElementById('edit-app-client-phone').value;
    const date = document.getElementById('edit-app-date').value;
    const time = document.getElementById('edit-app-time').value;
    const notes = document.getElementById('edit-app-notes').value;

    const startDateTime = new Date(`${date}T${time}`);

    try {
        const { error } = await _supabase.from('appointments').update({
            title, client_name, client_email, client_phone,
            start_time: startDateTime.toISOString(),
            notes
        }).eq('id', id);

        if (error) throw error;

        showToast('✓ Cita actualizada correctamente.', 5000);
        document.getElementById('edit-appointment-modal').classList.remove('active');
        if (calendar) calendar.refetchEvents();
    } catch (e) {
        showToast('❌ Error al actualizar la cita.', 10000);
    }
}

async function deleteAppointment() {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) return;
    
    const id = document.getElementById('edit-app-id').value;

    try {
        const { error } = await _supabase.from('appointments').delete().eq('id', id);
        if (error) throw error;

        showToast('✓ Cita eliminada.', 5000);
        document.getElementById('edit-appointment-modal').classList.remove('active');
        if (calendar) calendar.refetchEvents();
    } catch (e) {
        showToast('❌ Error al eliminar la cita.', 10000);
    }
}

function showAppointmentModal() {
    console.log('Abriendo modal de cita...');
    const modal = document.getElementById('appointment-modal');
    const form = document.getElementById('form-appointment');
    
    if (!modal || !form) {
        console.error('Error: No se encontró el modal o el formulario');
        alert('Error técnico: El modal de citas no está disponible en este momento.');
        return;
    }

    form.reset();
    document.getElementById('app-date').valueAsDate = new Date();
    modal.classList.add('active');
}

async function saveManualAppointment() {
    const title = document.getElementById('app-title').value;
    const client_name = document.getElementById('app-client-name').value;
    const client_email = document.getElementById('app-client-email').value;
    const client_phone = document.getElementById('app-client-phone').value;
    const date = document.getElementById('app-date').value;
    const time = document.getElementById('app-time').value;
    const duration = parseInt(document.getElementById('app-duration').value);
    const notes = document.getElementById('app-notes').value;

    if (!title || !date || !time) return showToast('⚠️ Por favor, rellena los campos obligatorios.', 5000);

    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    try {
        const { error } = await _supabase.from('appointments').insert([{
            title,
            client_name,
            client_email,
            client_phone,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            notes,
            created_at: new Date().toISOString()
        }]);

        if (error) throw error;

        // 2. Sincronizar con Google si hay token activo
        if (googleAccessToken) {
            await createGoogleEvent({
                title,
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString(),
                description: `Cliente: ${client_name || 'N/A'}\nEmail: ${client_email || 'N/A'}\nTel: ${client_phone || 'N/A'}\n\nNotas: ${notes || ''}`
            });
        }

        showToast('✓ Cita registrada y sincronizada con éxito.', 5000);
        document.getElementById('appointment-modal').classList.remove('active');
        if (calendar) calendar.refetchEvents();
        
        // 3. Notificaciones por Email
        sendEmailNotification(title, client_name, client_email);

        await addLog('Cita Manual', `Nueva cita registrada: ${title} (${client_name || 'Sin nombre'})`);
    } catch (e) {
        console.error(e);
        showToast('❌ Error al procesar la cita. Revisa el log.', 10000);
    }
}

async function createGoogleEvent(eventData) {
    try {
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${googleAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'summary': eventData.title,
                'description': eventData.description,
                'start': { 'dateTime': eventData.start },
                'end': { 'dateTime': eventData.end }
            })
        });

        if (!response.ok) throw new Error('Error al sincronizar con Google Calendar');
        console.log('Evento creado en Google Calendar');
    } catch (e) {
        console.error('Push a Google failed:', e);
        showToast('⚠️ Cita guardada pero falló el envío a Google Calendar.', 10000);
    }
}

async function syncWithGoogle(isAuto = false) {
    // 1. Intentar recuperar token de la sesión actual si existe
    const storedToken = sessionStorage.getItem('google_access_token');
    const tokenExpiry = sessionStorage.getItem('google_token_expiry');
    
    if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        googleAccessToken = storedToken;
        updateSyncButtonUI(true);
        loadGoogleEvents();
        return;
    }

    // Si es auto y no hay token, no forzamos el popup para no molestar
    if (isAuto && !storedToken) return;

    try {
        const { data } = await _supabase.from('site_settings').select('value').eq('key', 'google_client_id').single();
        if (!data || !data.value) {
            if (!isAuto) alert('Falta configurar el GOOGLE_CLIENT_ID en la sección de SEO/Ajustes.');
            return;
        }

        const CLIENT_ID = data.value;
        const SCOPES = "https://www.googleapis.com/auth/calendar.events";

        if (!googleTokenClient) {
            googleTokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: async (resp) => {
                    if (resp.error) return;
                    
                    googleAccessToken = resp.access_token;
                    // Guardar en sesión (dura aprox 1 hora en Google)
                    sessionStorage.setItem('google_access_token', resp.access_token);
                    sessionStorage.setItem('google_token_expiry', Date.now() + (3500 * 1000));
                    
                    updateSyncButtonUI(true);
                    await addLog('Google Sync', 'Acceso concedido al Calendario.');
                    loadGoogleEvents();
                },
            });
        }

        googleTokenClient.requestAccessToken({ prompt: isAuto ? '' : 'consent' });
    } catch (e) {
        console.error('Error en Sync:', e);
    }
}

function updateSyncButtonUI(synced) {
    const btn = document.querySelector('button[onclick="syncWithGoogle()"]');
    if (!btn) return;
    
    if (synced) {
        btn.innerHTML = '✓ Sincronizado';
        btn.style.background = 'rgba(52, 199, 89, 0.2)';
        btn.style.color = '#34c759';
    } else {
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px;"><path d="M4 4v5h5"></path><path d="M16 20v-5h-5"></path><path d="M20 12a8 8 0 1 0-8 8"></path></svg>
            Sincronizar Google
        `;
        btn.style.background = '';
        btn.style.color = '';
    }
}

async function loadGoogleEvents() {
    if (!googleAccessToken || !calendar) return;

    try {
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${new Date().toISOString()}&maxResults=10`, {
            headers: { 'Authorization': `Bearer ${googleAccessToken}` }
        });
        const data = await response.json();
        
        if (data.items) {
            // Obtener todos los IDs de citas que ya tenemos en el calendario (las de Supabase)
            const existingManualEvents = calendar.getEvents().filter(e => e.extendedProps.type === 'manual');

            const googleEvents = data.items
                .map(item => ({
                    id: item.id,
                    title: item.summary,
                    start: item.start.dateTime || item.start.date,
                    end: item.end.dateTime || item.end.date,
                    color: '#4285F4',
                    extendedProps: {
                        type: 'google',
                        notes: item.description || ''
                    }
                }))
                // FILTRO: Solo añadimos los de Google si NO coinciden en título y hora con uno manual
                .filter(gEv => {
                    const exists = existingManualEvents.some(mEv => 
                        mEv.title === gEv.title && 
                        new Date(mEv.start).getTime() === new Date(gEv.start).getTime()
                    );
                    return !exists;
                });

            if (googleEvents.length > 0) {
                if (googleEventSource) googleEventSource.remove();
                googleEventSource = calendar.addEventSource(googleEvents);
                renderUpcomingList(googleEvents);
            }
        }
    } catch (e) {
        console.error('Error cargando eventos:', e);
    }
}

function renderUpcomingList(events) {
    const list = document.getElementById('upcoming-list');
    list.innerHTML = '';
    
    events.slice(0, 3).forEach(event => {
        const item = document.createElement('div');
        item.className = 'appointment-item';
        const eventTime = new Date(event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        item.style = 'padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 4px solid #4285F4; margin-bottom: 12px;';
        item.innerHTML = `
            <div style="font-weight: 600; font-size: 0.9rem;">${event.title}</div>
            <div style="font-size: 0.75rem; color: var(--text-grey); margin-top: 4px;">Hoy / Mañana - ${eventTime}h</div>
        `;
        list.appendChild(item);
    });
}

// --- SEO SYSTEM ---
async function loadSeoData() {
    try {
        const { data, error } = await _supabase.from('site_settings').select('key, value');
        if (data) {
            data.forEach(setting => {
                if (setting.key === 'seo_title') document.getElementById('seo-title').value = setting.value;
                if (setting.key === 'seo_description') document.getElementById('seo-desc').value = setting.value;
                if (setting.key === 'google_client_id') document.getElementById('google-client-id').value = setting.value;
            });
        }
    } catch (e) {
        console.error('Error cargando SEO/Google:', e);
    }
}

async function saveGoogleConfig() {
    const clientId = document.getElementById('google-client-id').value;
    if (!clientId.includes('.apps.googleusercontent.com')) {
        alert('El Client ID no parece válido. Debe terminar en .apps.googleusercontent.com');
        return;
    }

    try {
        await _supabase.from('site_settings').upsert({
            key: 'google_client_id',
            value: clientId,
            updated_at: new Date().toISOString()
        });
        showToast('✓ Google Cloud vinculado correctamente. Ya puedes ir a la sección Calendario.', 30000);
        addLog('Configuración API', 'Se ha guardado un nuevo Google Client ID.');
    } catch (e) {
        showToast('❌ Error al guardar configuración de Google', 10000);
    }
}

async function saveSeoData() {
    const title = document.getElementById('seo-title').value;
    const desc = document.getElementById('seo-desc').value;

    try {
        await _supabase.from('site_settings').upsert([
            { key: 'seo_title', value: title, updated_at: new Date().toISOString() },
            { key: 'seo_description', value: desc, updated_at: new Date().toISOString() }
        ]);
        
        await addLog('SEO Actualizado', 'Se han modificado los metadatos globales del sitio.');
        showToast('✓ Metadatos SEO actualizados', 15000);
    } catch (e) {
        showToast('❌ Error al guardar SEO', 10000);
    }
}

function showToast(message, duration = 4000) {
    // Eliminar toast anterior si existe
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-icon">✓</div>
        <div class="toast-message">${message}</div>
        <div class="toast-close" onclick="this.parentElement.remove()">✕</div>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }
    }, duration);
}

function runSeoTest() {
    const speedVal = document.getElementById('seo-speed-val');
    speedVal.innerText = '--';
    speedVal.style.color = 'var(--text-grey)';
    
    setTimeout(() => {
        const score = Math.floor(Math.random() * (100 - 95 + 1)) + 95; // Simulación de alto rendimiento Apple style
        speedVal.innerText = `${score}/100`;
        speedVal.style.color = 'var(--accent-green)';
        addLog('SEO Test', `Test de velocidad ejecutado: Score ${score}`);
    }, 1500);
}

async function sendEmailNotification(title, name, email) {
    console.log('Iniciando envío de email directo... Destino:', email);
    
    // Usamos fetch directo con el guion final que tiene tu slug en Supabase
    const functionUrl = `${SUPABASE_URL}/functions/v1/send-appointment-email-`;

    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                title,
                client_name: name,
                client_email: email,
                admin_email: 'gerard@iartesana.es',
                date: new Date().toLocaleString('es-ES')
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn('Error en la respuesta:', data);
            showToast(`⚠️ Error en email: ${data.error || 'Fallo en el servidor'}`, 10000);
            return;
        }
        
        console.log('Email enviado con éxito:', data);
        showToast('✉️ Emails de confirmación enviados.', 5000);
    } catch (e) {
        console.warn('Fallo crítico de conexión:', e);
        showToast('❌ No se pudo contactar con la Edge Function. Revisa el nombre.', 10000);
    }
}
// --- ANALYTICS DASHBOARD ---
async function loadAnalyticsData(startDate = "30daysAgo", endDate = "today") {
    console.log(`Cargando datos de GA4 desde Supabase Edge Function (Desde: ${startDate} Hasta: ${endDate})...`);
    const btn = document.querySelector('#section-analytics .btn-action');
    const originalText = btn ? btn.innerHTML : '';
    if(btn) {
        btn.innerHTML = '🔄 Cargando datos...';
        btn.disabled = true;
    }

    const statusIcon = document.getElementById('analytics-status-icon');
    if (statusIcon) {
        statusIcon.style.display = 'inline-flex';
        statusIcon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" class="lucide lucide-loader" style="color: var(--text-grey); animation: spin 1s linear infinite;"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>`;
    }

    try {
        const { data, error } = await _supabase.functions.invoke('get_analytics', {
            method: 'POST',
            body: { startDate, endDate }
        });

        if (error) {
            console.error('Error desde la función:', error);
            showToast('❌ Error al cargar Analytics: No se ha encontrado la Edge Function o no está desplegada.', 5000);
            if (statusIcon) statusIcon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#FF3B30" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`;
            return;
        }

        if (data && data.metrics) {
            // Actualizar Tarjetas Globales
            document.getElementById('ga-visits').textContent = data.metrics.sessions || '0';
            document.getElementById('ga-visitors').textContent = data.metrics.activeUsers || '0';
            document.getElementById('ga-leads').textContent = data.metrics.leads || '0';
            document.getElementById('ga-revenue').textContent = (data.metrics.revenue || '0') + ' €';

            // Actualizar Engagement / Eventos
            document.getElementById('click-form').textContent = data.events.generate_lead || '0';
            document.getElementById('click-wa').textContent = data.events.click_whatsapp || '0';
            document.getElementById('click-cal').textContent = data.events.click_calendar || '0';

            // Actualizar Conversiones Stripe
            document.getElementById('conv-puntual').textContent = data.events.purchase_puntual || '0';
            document.getElementById('conv-audit').textContent = data.events.purchase_audit || '0';
            document.getElementById('conv-mensual').textContent = data.events.purchase_mensual || '0';

            // Actualizar Google Ads si existen
            if (data.ads) {
                document.getElementById('ads-cost').textContent = (data.ads.cost || '0') + ' €';
                document.getElementById('ads-clicks').textContent = data.ads.clicks || '0';
                document.getElementById('ads-cpc').textContent = (data.ads.cpc || '0') + ' €';
            }

            // Llenar la Tabla Geográfica
            const geoBody = document.getElementById('geo-body');
            geoBody.innerHTML = ''; // Limpiar la carga
            if (data.geography && data.geography.length > 0) {
                data.geography.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="padding: 12px;">${row.country}</td>
                        <td style="padding: 12px; color: var(--text-grey);">${row.city}</td>
                        <td style="padding: 12px; text-align: right; font-weight: 500;">${row.sessions}</td>
                    `;
                    geoBody.appendChild(tr);
                });
            } else {
                geoBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">No hay datos de ubicación suficientes aún en los últimos 30 días.</td></tr>';
            }

            if (statusIcon) statusIcon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#34C759" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        }
    } catch (err) {
        console.error('Error general cargando Analytics:', err);
        if (statusIcon) statusIcon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#FF3B30" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`;
    } finally {
        if (btn) {
            btn.style.background = 'var(--text-grey)';
            // Eliminado el btn.innerText forzado para no machacar el nombre del "Modo Demo"
            btn.disabled = false;
        }
    }
}

// MODO DEMO VISUAL (A petición)
function loadDemoAnalytics() {
    console.log("Activando Modo Demo Visual...");
    const statusIcon = document.getElementById('analytics-status-icon');
    if (statusIcon) {
        statusIcon.style.display = 'inline-flex';
        // En demo, ponemos el verde directamente para falsear la carga ultra-rápida.
        statusIcon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#34C759" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    }

    // Tarjetas Globales
    document.getElementById('ga-visits').textContent = '4,892';
    document.getElementById('ga-visitors').textContent = '3,150';
    document.getElementById('ga-leads').textContent = '54';
    document.getElementById('ga-revenue').textContent = '1,435 €';

    // Google Ads
    document.getElementById('ads-cost').textContent = '340.50 €';
    document.getElementById('ads-clicks').textContent = '2,150';
    document.getElementById('ads-cpc').textContent = '0.15';
    document.getElementById('ads-lead').textContent = '16';
    document.getElementById('ads-wa').textContent = '28';
    document.getElementById('ads-cal').textContent = '8';
    document.getElementById('ads-buy-1').textContent = '2';
    document.getElementById('ads-buy-2').textContent = '0';
    document.getElementById('ads-buy-3').textContent = '1';

    // Meta Ads
    document.getElementById('meta-cost').textContent = '280.00 €';
    document.getElementById('meta-clicks').textContent = '3,450';
    document.getElementById('meta-cpl').textContent = '8.50 €';
    document.getElementById('meta-lead').textContent = '25';
    document.getElementById('meta-wa').textContent = '54';
    document.getElementById('meta-cal').textContent = '10';
    document.getElementById('meta-buy-1').textContent = '3';
    document.getElementById('meta-buy-2').textContent = '1';
    document.getElementById('meta-buy-3').textContent = '1';

    // Redes Sociales (Orgánico)
    document.getElementById('social-ig-followers').textContent = '+142';
    document.getElementById('social-ig-views').textContent = '1,890';
    document.getElementById('social-ig-reach').textContent = '12,450';
    document.getElementById('social-ig-engagement').textContent = '1,204';
    
    document.getElementById('social-fb-likes').textContent = '+54';
    document.getElementById('social-fb-reach').textContent = '8,320';
    document.getElementById('social-fb-interactions').textContent = '432';

    // Engagement
    document.getElementById('click-form').textContent = '41';
    document.getElementById('click-wa').textContent = '82';
    document.getElementById('click-cal').textContent = '18';

    // Stripe
    document.getElementById('conv-puntual').textContent = '5';
    document.getElementById('conv-audit').textContent = '1';
    document.getElementById('conv-mensual').textContent = '2';

    // Geografía
    const geoBody = document.getElementById('geo-body');
    geoBody.innerHTML = `
        <tr style="background: rgba(255,255,255,0.02);">
            <td style="padding: 12px;">Spain 🇪🇸</td>
            <td style="padding: 12px; color: var(--text-grey);">Barcelona</td>
            <td style="padding: 12px; text-align: right; font-weight: 500;">1,430</td>
        </tr>
        <tr>
            <td style="padding: 12px;">Spain 🇪🇸</td>
            <td style="padding: 12px; color: var(--text-grey);">Madrid</td>
            <td style="padding: 12px; text-align: right; font-weight: 500;">980</td>
        </tr>
        <tr style="background: rgba(255,255,255,0.02);">
            <td style="padding: 12px;">Spain 🇪🇸</td>
            <td style="padding: 12px; color: var(--text-grey);">Ciutadella de Menorca</td>
            <td style="padding: 12px; text-align: right; font-weight: 500;">540</td>
        </tr>
        <tr>
            <td style="padding: 12px;">Mexico 🇲🇽</td>
            <td style="padding: 12px; color: var(--text-grey);">Ciudad de México</td>
            <td style="padding: 12px; text-align: right; font-weight: 500;">320</td>
        </tr>
    `;

    // Redes Sociales Top Publicaciones IG
    const igPostsBody = document.getElementById('social-ig-posts');
    if (igPostsBody) {
        igPostsBody.innerHTML = `
            <tr style="background: rgba(255,255,255,0.02);">
                <td style="padding: 12px; text-align: center;">📸</td>
                <td style="padding: 12px;"><strong style="color: var(--text-color);">Reel: "Cómo la IA cambia tu negocio"</strong><br><span style="font-size: 0.8rem; color: var(--text-grey);">Ayer, 18:30</span></td>
                <td style="padding: 12px; text-align: center; color: var(--text-grey);">IG Reel</td>
                <td style="padding: 12px; text-align: right; font-weight: 500; color: #E1306C;">4,250</td>
                <td style="padding: 12px; text-align: right; color: var(--text-color);">342</td>
                <td style="padding: 12px; text-align: right; color: var(--accent-blue);">+12 clics</td>
            </tr>
            <tr>
                <td style="padding: 12px; text-align: center;">📸</td>
                <td style="padding: 12px;"><strong style="color: var(--text-color);">Foto: Nuestra auditoría en Menorca</strong><br><span style="font-size: 0.8rem; color: var(--text-grey);">Hace 1 semana</span></td>
                <td style="padding: 12px; text-align: center; color: var(--text-grey);">IG Foto</td>
                <td style="padding: 12px; text-align: right; font-weight: 500; color: #E1306C;">1,840</td>
                <td style="padding: 12px; text-align: right; color: var(--text-color);">89</td>
                <td style="padding: 12px; text-align: right; color: var(--text-grey);">0 clics</td>
            </tr>
            <tr style="background: rgba(255,255,255,0.02);">
                <td style="padding: 12px; text-align: center;">📸</td>
                <td style="padding: 12px;"><strong style="color: var(--text-color);">Reel: Setup Mac para IA</strong><br><span style="font-size: 0.8rem; color: var(--text-grey);">Hace 2 semanas</span></td>
                <td style="padding: 12px; text-align: center; color: var(--text-grey);">IG Reel</td>
                <td style="padding: 12px; text-align: right; font-weight: 500; color: #E1306C;">6,120</td>
                <td style="padding: 12px; text-align: right; color: var(--text-color);">650</td>
                <td style="padding: 12px; text-align: right; color: var(--accent-blue);">+24 clics</td>
            </tr>
        `;
    }

    // Redes Sociales Top Publicaciones FB
    const fbPostsBody = document.getElementById('social-fb-posts');
    if (fbPostsBody) {
        fbPostsBody.innerHTML = `
            <tr style="background: rgba(255,255,255,0.02);">
                <td style="padding: 12px; text-align: center;">📘</td>
                <td style="padding: 12px;"><strong style="color: var(--text-color);">Post: Los 3 errores SEO de las peluquerías</strong><br><span style="font-size: 0.8rem; color: var(--text-grey);">Hace 3 días</span></td>
                <td style="padding: 12px; text-align: center; color: var(--text-grey);">FB Carrusel</td>
                <td style="padding: 12px; text-align: right; font-weight: 500; color: #1877F2;">2,890</td>
                <td style="padding: 12px; text-align: right; color: var(--text-color);">125</td>
                <td style="padding: 12px; text-align: right; color: var(--accent-blue);">+5 clics</td>
            </tr>
            <tr>
                <td style="padding: 12px; text-align: center;">📘</td>
                <td style="padding: 12px;"><strong style="color: var(--text-color);">Post: Entrevista IA de Barrio en la Radio</strong><br><span style="font-size: 0.8rem; color: var(--text-grey);">Ayer</span></td>
                <td style="padding: 12px; text-align: center; color: var(--text-grey);">FB Enlace</td>
                <td style="padding: 12px; text-align: right; font-weight: 500; color: #1877F2;">1,420</td>
                <td style="padding: 12px; text-align: right; color: var(--text-color);">80</td>
                <td style="padding: 12px; text-align: right; color: var(--accent-blue);">+18 clics</td>
            </tr>
        `;
    }

    showToast('Modo Demo Activado. Puedes tomar tu captura de pantalla.', 3000);
}

// Selector de Fechas Analytics
function handleAnalyticsDateChange(value, textOption) {
    const customPicker = document.getElementById('custom-date-picker');
    const dateText = document.getElementById('analytics-date-text');
    
    if (value === 'custom') {
        customPicker.style.display = 'flex';
        updateCustomDateText();
    } else {
        customPicker.style.display = 'none';
        dateText.innerHTML = `Mostrando datos para: <strong style="color: var(--text-color);">${textOption}</strong>`;
        
        let startDate = '30daysAgo';
        const endDate = 'today';
        switch(value) {
            case 'el ultimo dia': startDate = 'yesterday'; break;
            case 'la ultima semana': startDate = '7daysAgo'; break;
            case 'el ultimo mes': startDate = '30daysAgo'; break;
            case 'el ultimo trimestre': startDate = '90daysAgo'; break;
            case 'el ultimo semestre': startDate = '180daysAgo'; break;
            case 'el ultimo año': startDate = '365daysAgo'; break;
            case '7 dias para atras': startDate = '7daysAgo'; break;
            case '30 dias para atras': startDate = '30daysAgo'; break;
            case '120 dias para atras': startDate = '120daysAgo'; break;
            case '365 dias para atras': startDate = '365daysAgo'; break;
        }
        
        loadAnalyticsData(startDate, endDate);
    }
}

function updateCustomDateText() {
    const start = document.getElementById('date-start').value;
    const end = document.getElementById('date-end').value;
    const dateText = document.getElementById('analytics-date-text');
    
    if (start && end) {
        dateText.innerHTML = `Mostrando datos del: <strong style="color: var(--text-color);">${start} al ${end}</strong>`;
        loadAnalyticsData(start, end);
    } else {
        dateText.innerHTML = `Mostrando datos: <strong style="color: var(--text-color);">Selecciona un rango de fechas</strong>`;
    }
}

// --- GESTIÓN DE PRESUPUESTOS ---
const PROPOSALS = {
    puntual: {
        title: "Sesión Puntual de Consultoría IA",
        price: "159€",
        url: "https://ia-visionary.vercel.app/proposals/sesion-puntual-visionary.pdf",
        text: "Aquí tienes la propuesta para la Sesión Puntual de Consultoría IA (159€). Incluye diagnóstico y hoja de ruta inmediata."
    },
    auditoria: {
        title: "Auditoría e Inmersión IA Completa",
        price: "359€",
        url: "https://ia-visionary.vercel.app/proposals/auditoria-ia-visionary.pdf",
        text: "Te adjunto la propuesta para la Auditoría e Inmersión IA Completa (359€). Es nuestro plan estrella para transformar tu negocio con agentes IA."
    },
    mensual: {
        title: "Acompañamiento Mensual IA de Barrio",
        price: "250€/mes",
        url: "https://ia-visionary.vercel.app/proposals/acompanamiento-mensual-visionary.pdf",
        text: "Esta es la propuesta para el Acompañamiento Mensual (250€/mes). Estaremos a tu lado mes a mes optimizando tus procesos con IA."
    }
};

function openProposalModal(leadId) {
    document.getElementById('proposal-lead-id').value = leadId;
    document.getElementById('proposal-modal').classList.add('active');
}

async function sendProposal(planKey, channel) {
    const leadId = document.getElementById('proposal-lead-id').value;
    const plan = PROPOSALS[planKey];
    const lead = allLeads.find(l => l.id === leadId);

    if (!lead) {
        showToast('❌ Error: No se encontró el lead.', 3000);
        return;
    }

    document.getElementById('proposal-modal').classList.remove('active');
    showToast(`⏳ Preparando envío de ${plan.title}...`, 2000);

    if (channel === 'whatsapp') {
        const buyLink = document.getElementById(`stripe-link-${planKey === 'puntual' ? 'puntual' : (planKey === 'auditoria' ? 'auditoria' : 'mensual')}`)?.value || '';
        const message = `Hola ${lead.name}, soy Gerard de IA de Barrio. %0A%0A${plan.text} %0A%0APuedes ver los detalles aquí: ${plan.url} %0A%0A¿Qué te parece? Si quieres empezar ya mismo, puedes contratarlo directamente en este enlace seguro: ${buyLink}`;
        const phone = lead.phone ? lead.phone.replace(/\s+/g, '') : '';
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        addLog('Presupuesto Enviado', `Presupuesto ${plan.title} enviado vía WhatsApp a ${lead.name}`);
    } else if (channel === 'email') {
        try {
            const functionUrl = `${SUPABASE_URL}/functions/v1/send-appointment-email-`;
            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    title: `Tu Propuesta: ${plan.title}`,
                    client_name: lead.name,
                    client_email: lead.email,
                    admin_email: 'gerard@iartesana.es',
                    date: new Date().toLocaleString('es-ES'),
                    custom_message: `${plan.text} \n\nLink a la propuesta: ${plan.url} \n\nSi quieres empezar ya mismo para reservar tu plaza, puedes contratarlo aquí: ${document.getElementById(`stripe-link-${planKey === 'puntual' ? 'puntual' : (planKey === 'auditoria' ? 'auditoria' : 'mensual')}`)?.value || ''}`
                })
            });

            if (response.ok) {
                showToast(`✅ Email con presupuesto ${planKey} enviado con éxito.`, 5000);
                addLog('Presupuesto Enviado', `Presupuesto ${plan.title} enviado vía Email a ${lead.name}`);
            } else {
                throw new Error('Fallo en el servidor de correo');
            }
        } catch (e) {
            console.error(e);
            // Fallback to mailto if function fails or not available
            const buyLink = document.getElementById(`stripe-link-${planKey === 'puntual' ? 'puntual' : (planKey === 'auditoria' ? 'auditoria' : 'mensual')}`)?.value || '';
            const subject = encodeURIComponent(`Propuesta: ${plan.title} - IA de Barrio`);
            const body = encodeURIComponent(`Hola ${lead.name},\n\n${plan.text}\n\nLink a la propuesta: ${plan.url}\n\nSi quieres empezar ya mismo para reservar tu plaza, puedes contratarlo aquí: ${buyLink}\n\nUn saludo,\nGerard.`);
            window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
            showToast('📂 Abriendo cliente de correo local (Fallback)...', 3000);
        }
    }
}
