/**
 * ContractFlow — Enterprise Full-Stack Application Logic
 * Author: Shruti Gupta (Roll No: 23102C0051)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==================== STATE MANAGEMENT ====================
    let allContracts = [];
    let currentFilter = 'ALL';
    let currentStageFilter = null;
    let selectedContractForReview = null;
    let selectedContractForDetails = null;
    let currentCurrency = 'USD';
    let activeRecipientName = 'Ravi Patel';

    const STAGES_ORDER = ['INITIATION', 'REVIEW', 'APPROVAL', 'EXECUTION', 'ANALYTICS', 'RENEWAL', 'EXPIRY', 'ARCHIVED'];

    // Timeline event audit store
    let auditTimelineEvents = [
        { time: 'Just now', title: 'System Online', desc: 'DevOps CI/CD Build #5 container active on port 8080.', pill: 'pill-completed', label: 'Verified' },
        { time: '10 mins ago', title: 'Quality Gate Passed', desc: 'Selenium E2E automation verified 5 critical journeys.', pill: 'pill-completed', label: 'Passed' },
        { time: '25 mins ago', title: 'Legal Workflow Ready', desc: '8-stage enterprise contract state machine initialized.', pill: 'pill-progress', label: 'Active' },
        { time: '1 hour ago', title: 'Container Deployed', desc: 'Image shrutigupta/contract-workflow:1.0.0-5 started.', pill: 'pill-completed', label: 'Deployed' }
    ];

    // Initial Seed Fallback Data (ensures 100% working offline / demo state)
    const fallbackSeeds = [
        { id: 1, contractId: 'CT-101', title: 'Cloud Infrastructure SLA 2026', vendor: 'AWS Corp', category: 'Software & Cloud', amount: 12500.0, dueDate: '2026-11-15', stage: 'INITIATION', status: 'SUBMITTED', description: 'Multi-region cloud hosting, 99.99% uptime guarantee and disaster recovery provisions.', reviewerNotes: 'Pending initial security assessment.', reviewedBy: 'Anita Sharma' },
        { id: 2, contractId: 'CT-102', title: 'Cybersecurity Penetration Audit', vendor: 'CyberSec Shield Ltd', category: 'Security & Compliance', amount: 18000.0, dueDate: '2026-11-20', stage: 'REVIEW', status: 'UNDER_REVIEW', description: 'Comprehensive black-box penetration testing and OWASP compliance reporting.', reviewerNotes: 'Reviewing scope with Infosec team.', reviewedBy: 'Ravi Patel' },
        { id: 3, contractId: 'CT-103', title: 'Corporate HQ Lease Extension', vendor: 'Prestige Commercial', category: 'Facilities & Real Estate', amount: 65000.0, dueDate: '2027-01-31', stage: 'APPROVAL', status: 'SUBMITTED', description: 'Three-year corporate headquarters facility lease extension with utility inclusions.', reviewerNotes: 'Executive board approval required.', reviewedBy: 'Neha Verma' },
        { id: 4, contractId: 'CT-104', title: 'Data Analytics & ML Pipeline SOW', vendor: 'DataSoft Innovations', category: 'Professional Services', amount: 34500.0, dueDate: '2026-12-10', stage: 'EXECUTION', status: 'APPROVED', description: 'Production deployment of automated customer predictive intelligence models.', reviewerNotes: 'Approved after budget sign-off.', reviewedBy: 'Ravi Patel' },
        { id: 5, contractId: 'CT-105', title: 'Employee Health & Wellness Policy', vendor: 'StarHealth Assurance', category: 'Human Resources', amount: 42000.0, dueDate: '2026-12-31', stage: 'ANALYTICS', status: 'APPROVED', description: 'Comprehensive group healthcare and wellness coverage for 500+ global employees.', reviewerNotes: 'HR policy compliance verified.', reviewedBy: 'Priya Nair' },
        { id: 6, contractId: 'CT-106', title: 'Enterprise ERP License Renewal', vendor: 'SAP SE', category: 'Enterprise Software', amount: 89000.0, dueDate: '2027-03-31', stage: 'RENEWAL', status: 'APPROVED', description: 'Annual core enterprise business ERP subscription and premium support tier.', reviewerNotes: 'Enterprise license renewed for fiscal year.', reviewedBy: 'Neha Verma' },
        { id: 7, contractId: 'CT-107', title: 'Logistics & Freight Master Agreement', vendor: 'Apex Freight Logistics', category: 'Supply Chain', amount: 28000.0, dueDate: '2026-10-30', stage: 'EXPIRY', status: 'REJECTED', description: 'Nationwide shipping and freight handling agreement with guaranteed delivery SLA.', reviewerNotes: 'Rejected due to excessive indemnity clauses.', reviewedBy: 'Ravi Patel' },
        { id: 8, contractId: 'CT-108', title: 'Archived Vendor NDA', vendor: 'InnoLabs Global', category: 'Legal / NDA', amount: 5000.0, dueDate: '2025-05-15', stage: 'ARCHIVED', status: 'APPROVED', description: 'Mutual two-way non-disclosure and intellectual property protection agreement.', reviewerNotes: 'Term fulfilled and archived.', reviewedBy: 'Ravi Patel' }
    ];

    // ==================== DOM ELEMENTS ====================
    const tableBody = document.getElementById('contractsTableBody');
    const tableRecordCount = document.getElementById('tableRecordCount');
    const globalSearchInput = document.getElementById('globalSearchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const stageNodes = document.querySelectorAll('.step-node');
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    // Notification dropdown
    const notifBellBtn = document.getElementById('notifBellBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    const clearNotifsBtn = document.getElementById('clearNotifsBtn');
    const notifCount = document.getElementById('notifCount');

    // Modals
    const newContractModal = document.getElementById('newContractModal');
    const newContractBtn = document.getElementById('newContractBtn');
    const closeNewContractModalBtn = document.getElementById('closeNewContractModalBtn');
    const cancelNewContractBtn = document.getElementById('cancelNewContractBtn');
    const newContractForm = document.getElementById('newContractForm');
    const formErrorBanner = document.getElementById('formErrorBanner');
    const formErrorMessage = document.getElementById('formErrorMessage');

    const reviewModal = document.getElementById('reviewModal');
    const closeReviewModalBtn = document.getElementById('closeReviewModalBtn');
    const modalApproveBtn = document.getElementById('modalApproveBtn');
    const modalRejectBtn = document.getElementById('modalRejectBtn');
    const reviewerNotesInput = document.getElementById('reviewerNotesInput');

    const detailsModal = document.getElementById('detailsModal');
    const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');
    const closeDetailsModalBtn2 = document.getElementById('closeDetailsModalBtn2');

    const tasksModal = document.getElementById('tasksModal');
    const closeTasksModalBtn = document.getElementById('closeTasksModalBtn');
    const closeTasksModalBtn2 = document.getElementById('closeTasksModalBtn2');
    const tasksModalList = document.getElementById('tasksModalList');

    const analyticsModal = document.getElementById('analyticsModal');
    const closeAnalyticsModalBtn = document.getElementById('closeAnalyticsModalBtn');
    const closeAnalyticsModalBtn2 = document.getElementById('closeAnalyticsModalBtn2');

    const reportsModal = document.getElementById('reportsModal');
    const closeReportsModalBtn = document.getElementById('closeReportsModalBtn');
    const closeReportsModalBtn2 = document.getElementById('closeReportsModalBtn2');
    const downloadCsvReportBtn = document.getElementById('downloadCsvReportBtn');

    const templatesModal = document.getElementById('templatesModal');
    const closeTemplatesModalBtn = document.getElementById('closeTemplatesModalBtn');
    const closeTemplatesModalBtn2 = document.getElementById('closeTemplatesModalBtn2');

    const devopsModal = document.getElementById('devopsModal');
    const closeDevopsModalBtn = document.getElementById('closeDevopsModalBtn');
    const closeDevopsModalBtn2 = document.getElementById('closeDevopsModalBtn2');

    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
    const closeSettingsModalBtn2 = document.getElementById('closeSettingsModalBtn2');
    const currencySelect = document.getElementById('currencySelect');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');

    const messageModal = document.getElementById('messageModal');
    const closeMessageModalBtn = document.getElementById('closeMessageModalBtn');
    const closeMessageModalBtn2 = document.getElementById('closeMessageModalBtn2');
    const stakeholderMessageForm = document.getElementById('stakeholderMessageForm');
    const msgContractSelect = document.getElementById('msgContractSelect');

    const stakeholdersModal = document.getElementById('stakeholdersModal');
    const closeStakeholdersModalBtn = document.getElementById('closeStakeholdersModalBtn');
    const closeStakeholdersModalBtn2 = document.getElementById('closeStakeholdersModalBtn2');

    const timelineModal = document.getElementById('timelineModal');
    const closeTimelineModalBtn = document.getElementById('closeTimelineModalBtn');
    const closeTimelineModalBtn2 = document.getElementById('closeTimelineModalBtn2');
    const fullTimelineContent = document.getElementById('fullTimelineContent');

    const profileModal = document.getElementById('profileModal');
    const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
    const closeProfileModalBtn2 = document.getElementById('closeProfileModalBtn2');
    const userProfileCard = document.getElementById('userProfileCard');

    // ==================== CURRENCY HELPER ====================
    function formatMoney(amount) {
        const val = Number(amount || 0);
        switch (currentCurrency) {
            case 'EUR':
                return '€' + val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            case 'GBP':
                return '£' + val.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            case 'INR':
                return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            case 'USD':
            default:
                return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }

    // ==================== FETCH CONTRACTS FROM API ====================
    async function loadContracts() {
        try {
            const res = await fetch('/api/contracts');
            if (res.ok) {
                allContracts = await res.json();
            } else {
                allContracts = [...fallbackSeeds];
            }
        } catch (err) {
            console.log('Using local fallback state:', err);
            if (allContracts.length === 0) {
                allContracts = [...fallbackSeeds];
            }
        }
        renderTable();
        updateMetrics();
        populateContractSelects();
    }

    // ==================== RENDER CONTRACTS TABLE ====================
    function renderTable() {
        const query = (globalSearchInput.value || '').toLowerCase().trim();

        const filtered = allContracts.filter(c => {
            // Status Toolbar Filter
            if (currentFilter !== 'ALL' && c.status !== currentFilter) return false;
            // 8-Stage Stepper Filter
            if (currentStageFilter && c.stage !== currentStageFilter) return false;
            // Global Search Matching
            if (query) {
                const matchId = (c.contractId || '').toLowerCase().includes(query);
                const matchTitle = (c.title || '').toLowerCase().includes(query);
                const matchVendor = (c.vendor || '').toLowerCase().includes(query);
                const matchCategory = (c.category || '').toLowerCase().includes(query);
                const matchStatus = (c.status || '').toLowerCase().includes(query);
                if (!matchId && !matchTitle && !matchVendor && !matchCategory && !matchStatus) return false;
            }
            return true;
        });

        tableRecordCount.textContent = `${filtered.length} Contract${filtered.length === 1 ? '' : 's'}`;

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 48px 20px; color: #94A3B8;">
                        <svg style="width: 44px; height: 44px; stroke: #CBD5E1; margin-bottom: 10px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <p style="font-weight: 700; color: #475569; font-size: 0.95rem;">No contracts found matching your filters</p>
                        <p style="font-size: 0.8rem; margin-top: 4px;">Try clearing your search query or selecting 'All' in the toolbar.</p>
                        <button class="btn btn-secondary" onclick="resetAllFilters()" style="margin-top: 14px; padding: 6px 14px; font-size: 0.8rem;">Reset All Filters</button>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = filtered.map(c => {
            const badgeClass = getStatusBadgeClass(c.status);
            const formattedAmount = formatMoney(c.amount);

            return `
                <tr id="contract-row-${c.contractId}">
                    <td class="text-mono font-bold" style="color: #6366F1; cursor: pointer;" onclick="openDetailsModalForId(${c.id})">${c.contractId}</td>
                    <td style="font-weight: 600; color: #0F172A; cursor: pointer;" onclick="openDetailsModalForId(${c.id})">
                        ${escapeHtml(c.title)}
                    </td>
                    <td style="color: #475569;">${escapeHtml(c.vendor)}</td>
                    <td><span class="stage-pill">${escapeHtml(c.category)}</span></td>
                    <td class="font-bold text-emerald">${formattedAmount}</td>
                    <td style="color: #64748B;">${c.dueDate || '—'}</td>
                    <td>
                        <span class="stage-pill" style="background: rgba(99, 102, 241, 0.08); color: #4338CA; font-weight: 700;">
                            ${c.stage}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${badgeClass}" id="statusBadge-${c.contractId}">
                            ${formatStatusLabel(c.status)}
                        </span>
                    </td>
                    <td class="text-right">
                        <div class="action-btn-group">
                            <!-- Review & Decide Button -->
                            <button class="btn-sm btn-review" id="reviewBtn-${c.contractId}" title="Review & Decide" onclick="openReviewModalForId(${c.id})">
                                <svg style="width: 12px; height: 12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                <span>Review</span>
                            </button>
                            <!-- View Details Button -->
                            <button class="btn-icon-action btn-action-view" title="View Full Details" onclick="openDetailsModalForId(${c.id})">
                                <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <!-- Advance Stage Button -->
                            <button class="btn-icon-action btn-action-advance" title="Advance Stage" onclick="advanceContractStage(${c.id})">
                                <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                            <!-- Delete Button -->
                            <button class="btn-icon-action btn-action-delete" title="Delete Contract" onclick="deleteContractById(${c.id})">
                                <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'SUBMITTED': return 'badge-submitted';
            case 'UNDER_REVIEW': return 'badge-under-review';
            case 'APPROVED': return 'badge-approved';
            case 'REJECTED': return 'badge-rejected';
            default: return 'badge-submitted';
        }
    }

    function formatStatusLabel(status) {
        if (!status) return 'Submitted';
        return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }

    // ==================== UPDATE METRICS, DONUT & LISTS ====================
    function updateMetrics() {
        const total = allContracts.length;
        const submitted = allContracts.filter(c => c.status === 'SUBMITTED').length;
        const underReview = allContracts.filter(c => c.status === 'UNDER_REVIEW').length;
        const approved = allContracts.filter(c => c.status === 'APPROVED').length;
        const rejected = allContracts.filter(c => c.status === 'REJECTED').length;

        // Toolbar Counts
        document.getElementById('countPillAll').textContent = total;
        document.getElementById('countPillSubmitted').textContent = submitted;
        document.getElementById('countPillReview').textContent = underReview;
        document.getElementById('countPillApproved').textContent = approved;
        document.getElementById('countPillRejected').textContent = rejected;

        // Donut center count
        const totalCountElem = document.getElementById('metricTotalCount');
        if (totalCountElem) totalCountElem.textContent = total;

        // Update counts in Stepper
        const stageCounts = {};
        allContracts.forEach(c => {
            stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
        });

        STAGES_ORDER.forEach(s => {
            const el = document.getElementById(`count-${s}`);
            if (el) {
                const count = stageCounts[s] || 0;
                el.textContent = `${count} ${s === 'ARCHIVED' ? 'Total' : 'Active'}`;
            }
        });

        // Update Tasks badge in sidebar
        const pendingTotal = submitted + underReview;
        const tasksBadge = document.getElementById('tasksBadge');
        if (tasksBadge) tasksBadge.textContent = pendingTotal;

        // Update Card 3: Contracts Due Soon (Sort by date)
        renderDueSoonCard();

        // Update Card 4: Tasks Assigned to You
        renderAssignedTasksCard();
    }

    // Render Contracts Due Soon dynamically
    function renderDueSoonCard() {
        const dueList = document.querySelector('.due-list');
        if (!dueList) return;

        const sorted = [...allContracts]
            .filter(c => c.dueDate)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 3);

        if (sorted.length === 0) {
            dueList.innerHTML = `<div style="padding: 12px; color: #94A3B8; font-size: 0.8rem;">No upcoming contract deadlines.</div>`;
            return;
        }

        dueList.innerHTML = sorted.map((c, i) => {
            const tagClass = i === 0 ? 'tag-urgent' : (i === 1 ? 'tag-warning' : 'tag-normal');
            return `
                <div class="due-item pointer" onclick="openDetailsModalForId(${c.id})">
                    <div class="due-info">
                        <span class="due-title">${escapeHtml(c.title)}</span>
                        <span class="due-category">${escapeHtml(c.category)} • ${c.contractId}</span>
                    </div>
                    <span class="due-tag ${tagClass}">${c.dueDate}</span>
                </div>
            `;
        }).join('');
    }

    // Render Tasks Assigned to You dynamically
    function renderAssignedTasksCard() {
        const tasksList = document.querySelector('.tasks-list');
        if (!tasksList) return;

        const pending = allContracts.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').slice(0, 3);

        if (pending.length === 0) {
            tasksList.innerHTML = `<div style="padding: 12px; color: #10B981; font-size: 0.82rem; font-weight: 600;">All contract tasks completed! 🎉</div>`;
            return;
        }

        tasksList.innerHTML = pending.map(c => `
            <div class="task-item pointer" onclick="openReviewModalForId(${c.id})">
                <div class="task-info">
                    <span class="task-action-name">Review ${escapeHtml(c.title)}</span>
                    <span class="task-meta">${c.vendor} • Value: ${formatMoney(c.amount)}</span>
                </div>
                <span class="task-deadline deadline-today" style="font-weight: 700;">Review &rarr;</span>
            </div>
        `).join('');
    }

    // Populate select elements across modals with contracts list
    function populateContractSelects() {
        if (!msgContractSelect) return;
        msgContractSelect.innerHTML = allContracts.map(c => `
            <option value="${c.contractId}">${c.contractId} — ${c.title} (${c.vendor})</option>
        `).join('');
    }

    // ==================== RESET ALL FILTERS ====================
    window.resetAllFilters = function() {
        currentFilter = 'ALL';
        currentStageFilter = null;
        globalSearchInput.value = '';
        filterButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === 'ALL'));
        stageNodes.forEach(n => n.classList.remove('active'));
        renderTable();
        showToast('All filters reset to default view', 'success');
    };

    // ==================== STEPPER FILTERING ====================
    stageNodes.forEach(node => {
        node.addEventListener('click', () => {
            const stage = node.getAttribute('data-stage');
            if (currentStageFilter === stage) {
                currentStageFilter = null;
                node.classList.remove('active');
            } else {
                stageNodes.forEach(n => n.classList.remove('active'));
                node.classList.add('active');
                currentStageFilter = stage;
            }
            renderTable();
        });
    });

    // ==================== STATUS TOOLBAR FILTERS ====================
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTable();
        });
    });

    // Search bar event
    globalSearchInput.addEventListener('input', () => {
        renderTable();
    });

    // Donut reset filter pill
    const filterStatusAll = document.getElementById('filterStatusAll');
    if (filterStatusAll) {
        filterStatusAll.addEventListener('click', () => {
            window.resetAllFilters();
        });
    }

    // View all due / tasks buttons
    const viewAllDueBtn = document.getElementById('viewAllDueBtn');
    if (viewAllDueBtn) {
        viewAllDueBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('contractsSection').scrollIntoView({ behavior: 'smooth' });
        });
    }

    const viewAllTasksBtn = document.getElementById('viewAllTasksBtn');
    if (viewAllTasksBtn) {
        viewAllTasksBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openTasksModal();
        });
    }

    // ==================== SIDEBAR NAVIGATION ACTIONS ====================
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const href = item.getAttribute('href');
            switch (href) {
                case '#dashboard':
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    showToast('Switched to Dashboard Overview', 'success');
                    break;
                case '#contracts':
                    document.getElementById('contractsSection').scrollIntoView({ behavior: 'smooth' });
                    break;
                case '#workflow':
                    document.getElementById('stepperTrack').scrollIntoView({ behavior: 'smooth' });
                    break;
                case '#tasks':
                    openTasksModal();
                    break;
                case '#analytics':
                    openAnalyticsModal();
                    break;
                case '#reports':
                    openReportsModal();
                    break;
                case '#templates':
                    openTemplatesModal();
                    break;
                case '#integrations':
                    openDevopsModal();
                    break;
                case '#settings':
                    openSettingsModal();
                    break;
            }
        });
    });

    // User Profile Card click
    if (userProfileCard) {
        userProfileCard.addEventListener('click', () => {
            profileModal.classList.add('open');
        });
    }
    if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', () => profileModal.classList.remove('open'));
    if (closeProfileModalBtn2) closeProfileModalBtn2.addEventListener('click', () => profileModal.classList.remove('open'));

    // Notification Bell Toggle
    if (notifBellBtn) {
        notifBellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('open');
        });
    }

    if (clearNotifsBtn) {
        clearNotifsBtn.addEventListener('click', () => {
            if (notifCount) notifCount.textContent = '0';
            const list = document.getElementById('notifList');
            if (list) list.innerHTML = `<div style="padding: 24px; text-align: center; color: #94A3B8; font-size: 0.85rem;">All notifications cleared.</div>`;
            showToast('All notifications marked as read', 'success');
        });
    }

    // Close notification dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (notifDropdown && notifDropdown.classList.contains('open') && !notifDropdown.contains(e.target) && e.target !== notifBellBtn) {
            notifDropdown.classList.remove('open');
        }
    });

    // ==================== CSV EXPORT FUNCTIONALITY ====================
    function exportContractsToCsv() {
        if (allContracts.length === 0) {
            showToast('No contracts available to export', 'error');
            return;
        }

        const headers = ['Contract ID', 'Title', 'Vendor', 'Category', 'Amount (USD)', 'Due Date', 'Stage', 'Status', 'Reviewer Notes', 'Reviewed By'];
        const rows = allContracts.map(c => [
            c.contractId || '',
            `"${(c.title || '').replace(/"/g, '""')}"`,
            `"${(c.vendor || '').replace(/"/g, '""')}"`,
            `"${(c.category || '').replace(/"/g, '""')}"`,
            c.amount || 0,
            c.dueDate || '',
            c.stage || '',
            c.status || '',
            `"${(c.reviewerNotes || '').replace(/"/g, '""')}"`,
            `"${(c.reviewedBy || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `contracts_registry_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Contracts registry exported to CSV successfully!', 'success');
    }

    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportContractsToCsv);
    if (downloadCsvReportBtn) downloadCsvReportBtn.addEventListener('click', exportContractsToCsv);

    // ==================== MODAL: CREATE CONTRACT ====================
    newContractBtn.addEventListener('click', () => {
        newContractForm.reset();
        formErrorBanner.classList.add('d-none');
        const d = new Date();
        d.setDate(d.getDate() + 30);
        document.getElementById('dueDateInput').value = d.toISOString().split('T')[0];
        newContractModal.classList.add('open');
    });

    function closeNewContractModal() {
        newContractModal.classList.remove('open');
    }

    closeNewContractModalBtn.addEventListener('click', closeNewContractModal);
    cancelNewContractBtn.addEventListener('click', closeNewContractModal);

    newContractForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('contractTitle').value.trim();
        const vendor = document.getElementById('vendorName').value.trim();
        const category = document.getElementById('categorySelect').value;
        const amount = parseFloat(document.getElementById('contractAmount').value);
        const dueDate = document.getElementById('dueDateInput').value;
        const description = document.getElementById('termsDescription').value.trim();

        if (!title || !vendor || !category || isNaN(amount) || amount <= 0) {
            formErrorBanner.classList.remove('d-none');
            formErrorMessage.textContent = 'Please provide valid values. Contract Amount must be greater than $0.00.';
            return;
        }

        formErrorBanner.classList.add('d-none');

        const payload = {
            title,
            vendor,
            category,
            amount,
            dueDate,
            description,
            stage: 'INITIATION',
            status: 'SUBMITTED'
        };

        try {
            const res = await fetch('/api/contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const saved = await res.json();
                allContracts.unshift(saved);
            } else {
                const newId = allContracts.length + 1;
                payload.id = newId;
                payload.contractId = `CT-${100 + newId}`;
                allContracts.unshift(payload);
            }
        } catch (err) {
            const newId = allContracts.length + 1;
            payload.id = newId;
            payload.contractId = `CT-${100 + newId}`;
            allContracts.unshift(payload);
        }

        // Add to audit timeline
        auditTimelineEvents.unshift({
            time: 'Just now',
            title: `Initiated ${payload.title}`,
            desc: `Submitted for $${payload.amount.toLocaleString()} with vendor ${payload.vendor}.`,
            pill: 'pill-progress',
            label: 'Initiated'
        });

        closeNewContractModal();
        renderTable();
        updateMetrics();
        populateContractSelects();
        showToast(`Contract ${payload.title} created successfully!`, 'success');
    });

    // ==================== MODAL: REVIEW CONTRACT ====================
    window.openReviewModalForId = function(id) {
        const contract = allContracts.find(c => c.id === id);
        if (!contract) return;
        selectedContractForReview = contract;

        document.getElementById('reviewDetailId').textContent = contract.contractId;
        document.getElementById('reviewDetailVendor').textContent = contract.vendor;
        document.getElementById('reviewDetailAmount').textContent = formatMoney(contract.amount);
        document.getElementById('reviewDetailStatus').innerHTML = `
            <span class="badge ${getStatusBadgeClass(contract.status)}">${formatStatusLabel(contract.status)}</span>
        `;
        document.getElementById('reviewDetailDesc').textContent = contract.description || 'No detailed terms provided.';
        reviewerNotesInput.value = contract.reviewerNotes || '';
        document.getElementById('reviewContractDatabaseId').value = contract.id;

        reviewModal.classList.add('open');
    };

    function closeReviewModal() {
        reviewModal.classList.remove('open');
        selectedContractForReview = null;
    }

    closeReviewModalBtn.addEventListener('click', closeReviewModal);

    // Approve Action
    modalApproveBtn.addEventListener('click', async () => {
        if (!selectedContractForReview) return;
        const id = selectedContractForReview.id;
        const notes = reviewerNotesInput.value.trim() || 'Approved by Legal Reviewer.';

        try {
            const res = await fetch(`/api/contracts/${id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewerNotes: notes, reviewerName: 'Ravi Patel (Legal Counsel)' })
            });
            if (res.ok) {
                const updated = await res.json();
                const idx = allContracts.findIndex(c => c.id === id);
                if (idx !== -1) allContracts[idx] = updated;
            } else {
                updateContractLocally(id, 'APPROVED', notes, 'EXECUTION');
            }
        } catch (e) {
            updateContractLocally(id, 'APPROVED', notes, 'EXECUTION');
        }

        auditTimelineEvents.unshift({
            time: 'Just now',
            title: `Approved ${selectedContractForReview.contractId}`,
            desc: `Terms approved by Legal Counsel. Remarks: "${notes}"`,
            pill: 'pill-completed',
            label: 'Approved'
        });

        launchConfetti();
        closeReviewModal();
        renderTable();
        updateMetrics();
        showToast(`Contract ${selectedContractForReview.contractId} Approved Successfully!`, 'success');
    });

    // Reject Action
    modalRejectBtn.addEventListener('click', async () => {
        if (!selectedContractForReview) return;
        const id = selectedContractForReview.id;
        const notes = reviewerNotesInput.value.trim() || 'Rejected due to contract clause revisions.';

        try {
            const res = await fetch(`/api/contracts/${id}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewerNotes: notes, reviewerName: 'Ravi Patel (Legal Counsel)' })
            });
            if (res.ok) {
                const updated = await res.json();
                const idx = allContracts.findIndex(c => c.id === id);
                if (idx !== -1) allContracts[idx] = updated;
            } else {
                updateContractLocally(id, 'REJECTED', notes, 'REVIEW');
            }
        } catch (e) {
            updateContractLocally(id, 'REJECTED', notes, 'REVIEW');
        }

        auditTimelineEvents.unshift({
            time: 'Just now',
            title: `Rejected ${selectedContractForReview.contractId}`,
            desc: `Revision requested. Reason: "${notes}"`,
            pill: 'pill-pending',
            label: 'Rejected'
        });

        closeReviewModal();
        renderTable();
        updateMetrics();
        showToast(`Contract ${selectedContractForReview.contractId} Rejected.`, 'error');
    });

    function updateContractLocally(id, status, notes, stage) {
        const item = allContracts.find(c => c.id === id);
        if (item) {
            item.status = status;
            item.reviewerNotes = notes;
            if (stage) item.stage = stage;
        }
    }

    // ==================== ADVANCE CONTRACT STAGE ====================
    window.advanceContractStage = async function(id) {
        const contract = allContracts.find(c => c.id === id);
        if (!contract) return;

        const currentIndex = STAGES_ORDER.indexOf(contract.stage);
        if (currentIndex === -1 || currentIndex >= STAGES_ORDER.length - 1) {
            showToast(`${contract.contractId} is already in the final stage (${contract.stage}).`, 'error');
            return;
        }

        const nextStage = STAGES_ORDER[currentIndex + 1];

        try {
            const res = await fetch(`/api/contracts/${id}/stage`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage: nextStage })
            });
            if (res.ok) {
                const updated = await res.json();
                const idx = allContracts.findIndex(c => c.id === id);
                if (idx !== -1) allContracts[idx] = updated;
            } else {
                contract.stage = nextStage;
            }
        } catch (e) {
            contract.stage = nextStage;
        }

        auditTimelineEvents.unshift({
            time: 'Just now',
            title: `Stage Promoted: ${contract.contractId}`,
            desc: `Contract moved forward from ${STAGES_ORDER[currentIndex]} to ${nextStage}.`,
            pill: 'pill-progress',
            label: 'Promoted'
        });

        renderTable();
        updateMetrics();
        showToast(`Advanced ${contract.contractId} to ${nextStage} stage!`, 'success');
    };

    // ==================== DELETE CONTRACT ====================
    window.deleteContractById = async function(id) {
        const contract = allContracts.find(c => c.id === id);
        if (!contract) return;

        if (!confirm(`Are you sure you want to delete ${contract.contractId} (${contract.title})?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
            if (res.ok) {
                allContracts = allContracts.filter(c => c.id !== id);
            } else {
                allContracts = allContracts.filter(c => c.id !== id);
            }
        } catch (e) {
            allContracts = allContracts.filter(c => c.id !== id);
        }

        showToast(`Contract ${contract.contractId} deleted successfully.`, 'success');
        renderTable();
        updateMetrics();
        populateContractSelects();
    };

    // ==================== MODAL: CONTRACT DETAILS ====================
    window.openDetailsModalForId = function(id) {
        const contract = allContracts.find(c => c.id === id);
        if (!contract) return;
        selectedContractForDetails = contract;

        document.getElementById('detailsId').textContent = contract.contractId;
        document.getElementById('detailsVendor').textContent = contract.vendor;
        document.getElementById('detailsCategory').textContent = contract.category;
        document.getElementById('detailsAmount').textContent = formatMoney(contract.amount);
        document.getElementById('detailsDueDate').textContent = contract.dueDate || 'No expiry specified';
        document.getElementById('detailsStage').innerHTML = `<span class="stage-pill">${contract.stage}</span>`;
        document.getElementById('detailsStatus').innerHTML = `
            <span class="badge ${getStatusBadgeClass(contract.status)}">${formatStatusLabel(contract.status)}</span>
        `;
        document.getElementById('detailsReviewedBy').textContent = contract.reviewedBy || 'Pending legal sign-off';
        document.getElementById('detailsDescription').textContent = contract.description || 'Comprehensive terms and conditions apply.';
        document.getElementById('detailsNotes').textContent = contract.reviewerNotes || 'No formal reviewer remarks recorded.';

        detailsModal.classList.add('open');
    };

    if (closeDetailsModalBtn) closeDetailsModalBtn.addEventListener('click', () => detailsModal.classList.remove('open'));
    if (closeDetailsModalBtn2) closeDetailsModalBtn2.addEventListener('click', () => detailsModal.classList.remove('open'));

    // ==================== MODAL: TASKS ====================
    function openTasksModal() {
        const pending = allContracts.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW');
        if (pending.length === 0) {
            tasksModalList.innerHTML = `<div style="text-align: center; padding: 30px; color: #10B981; font-weight: 700;">No pending tasks! All contracts reviewed.</div>`;
        } else {
            tasksModalList.innerHTML = pending.map(c => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md);">
                    <div>
                        <div style="font-weight: 700; color: #0F172A; font-size: 0.9rem;">${escapeHtml(c.title)}</div>
                        <div style="color: #64748B; font-size: 0.78rem;">${c.contractId} • ${c.vendor} • Value: ${formatMoney(c.amount)}</div>
                    </div>
                    <button class="btn btn-primary" onclick="tasksModal.classList.remove('open'); openReviewModalForId(${c.id});" style="padding: 6px 14px; font-size: 0.78rem;">
                        Review Now &rarr;
                    </button>
                </div>
            `).join('');
        }
        tasksModal.classList.add('open');
    }

    if (closeTasksModalBtn) closeTasksModalBtn.addEventListener('click', () => tasksModal.classList.remove('open'));
    if (closeTasksModalBtn2) closeTasksModalBtn2.addEventListener('click', () => tasksModal.classList.remove('open'));

    // ==================== MODAL: ANALYTICS ====================
    function openAnalyticsModal() {
        const totalVal = allContracts.reduce((acc, c) => acc + (c.amount || 0), 0);
        const avgVal = allContracts.length > 0 ? (totalVal / allContracts.length) : 0;
        const approvedCount = allContracts.filter(c => c.status === 'APPROVED').length;
        const approvalRate = allContracts.length > 0 ? Math.round((approvedCount / allContracts.length) * 100) : 0;

        document.getElementById('analyticsTotalValue').textContent = formatMoney(totalVal);
        document.getElementById('analyticsAvgValue').textContent = formatMoney(avgVal);
        document.getElementById('analyticsApprovalRate').textContent = `${approvalRate}%`;

        // Category breakdown
        const catMap = {};
        allContracts.forEach(c => {
            catMap[c.category] = (catMap[c.category] || 0) + (c.amount || 0);
        });

        const catList = document.getElementById('analyticsCategoryList');
        if (catList) {
            catList.innerHTML = Object.entries(catMap).map(([cat, val]) => {
                const pct = totalVal > 0 ? Math.round((val / totalVal) * 100) : 0;
                return `
                    <div class="cat-bar-item">
                        <div class="cat-bar-header">
                            <span>${cat}</span>
                            <span>${formatMoney(val)} (${pct}%)</span>
                        </div>
                        <div class="cat-progress-bg">
                            <div class="cat-progress-fill" style="width: ${pct}%;"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        analyticsModal.classList.add('open');
    }

    if (closeAnalyticsModalBtn) closeAnalyticsModalBtn.addEventListener('click', () => analyticsModal.classList.remove('open'));
    if (closeAnalyticsModalBtn2) closeAnalyticsModalBtn2.addEventListener('click', () => analyticsModal.classList.remove('open'));

    // ==================== MODAL: REPORTS ====================
    function openReportsModal() {
        reportsModal.classList.add('open');
    }
    if (closeReportsModalBtn) closeReportsModalBtn.addEventListener('click', () => reportsModal.classList.remove('open'));
    if (closeReportsModalBtn2) closeReportsModalBtn2.addEventListener('click', () => reportsModal.classList.remove('open'));

    // ==================== MODAL: TEMPLATES ====================
    function openTemplatesModal() {
        templatesModal.classList.add('open');
    }
    if (closeTemplatesModalBtn) closeTemplatesModalBtn.addEventListener('click', () => templatesModal.classList.remove('open'));
    if (closeTemplatesModalBtn2) closeTemplatesModalBtn2.addEventListener('click', () => templatesModal.classList.remove('open'));

    window.applyTemplate = function(type) {
        templatesModal.classList.remove('open');
        newContractForm.reset();

        const d = new Date();
        d.setDate(d.getDate() + 90);
        const futureDate = d.toISOString().split('T')[0];

        switch (type) {
            case 'cloud':
                document.getElementById('contractTitle').value = 'Enterprise Multi-Region Cloud SLA';
                document.getElementById('vendorName').value = 'Google Cloud Platform (GCP)';
                document.getElementById('categorySelect').value = 'Software & Cloud';
                document.getElementById('contractAmount').value = '45000';
                document.getElementById('dueDateInput').value = futureDate;
                document.getElementById('termsDescription').value = 'High-availability Kubernetes hosting, multi-zone automated backups, and 99.99% service uptime.';
                break;
            case 'nda':
                document.getElementById('contractTitle').value = 'Mutual Confidentiality & NDA Agreement';
                document.getElementById('vendorName').value = 'OpenTech Solutions Ltd';
                document.getElementById('categorySelect').value = 'Legal / NDA';
                document.getElementById('contractAmount').value = '5000';
                document.getElementById('dueDateInput').value = futureDate;
                document.getElementById('termsDescription').value = 'Two-way non-disclosure covering intellectual property, technical architecture, and proprietary algorithms.';
                break;
            case 'security':
                document.getElementById('contractTitle').value = 'SOC-2 Compliance & Penetration Testing';
                document.getElementById('vendorName').value = 'SecureWorks International';
                document.getElementById('categorySelect').value = 'Security & Compliance';
                document.getElementById('contractAmount').value = '24000';
                document.getElementById('dueDateInput').value = futureDate;
                document.getElementById('termsDescription').value = 'Comprehensive black-box application security audit, vulnerability remediation assessment, and compliance report.';
                break;
            case 'lease':
                document.getElementById('contractTitle').value = 'Corporate Office Lease Extension (3 Years)';
                document.getElementById('vendorName').value = 'Prestige Commercial Towers';
                document.getElementById('categorySelect').value = 'Facilities & Real Estate';
                document.getElementById('contractAmount').value = '95000';
                document.getElementById('dueDateInput').value = futureDate;
                document.getElementById('termsDescription').value = 'Three-year prime commercial facility lease with covered maintenance, utilities, and dedicated parking allocations.';
                break;
        }

        newContractModal.classList.add('open');
        showToast('Template applied! Review and submit your contract.', 'success');
    };

    // ==================== MODAL: DEVOPS MONITOR ====================
    function openDevopsModal() {
        devopsModal.classList.add('open');
    }
    if (closeDevopsModalBtn) closeDevopsModalBtn.addEventListener('click', () => devopsModal.classList.remove('open'));
    if (closeDevopsModalBtn2) closeDevopsModalBtn2.addEventListener('click', () => devopsModal.classList.remove('open'));

    // ==================== MODAL: SETTINGS ====================
    function openSettingsModal() {
        if (currencySelect) currencySelect.value = currentCurrency;
        settingsModal.classList.add('open');
    }
    if (closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', () => settingsModal.classList.remove('open'));
    if (closeSettingsModalBtn2) closeSettingsModalBtn2.addEventListener('click', () => settingsModal.classList.remove('open'));

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            currentCurrency = currencySelect.value;
            settingsModal.classList.remove('open');
            renderTable();
            updateMetrics();
            showToast(`Currency updated to ${currentCurrency}!`, 'success');
        });
    }

    // ==================== MODAL: STAKEHOLDER DIRECT MESSAGE ====================
    document.querySelectorAll('.msg-icon-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.stakeholder-card');
            const name = card ? card.querySelector('.stakeholder-name').textContent : 'Stakeholder';
            activeRecipientName = name;
            document.getElementById('messageModalTitle').textContent = `Message ${name}`;
            populateContractSelects();
            messageModal.classList.add('open');
        });
    });

    if (closeMessageModalBtn) closeMessageModalBtn.addEventListener('click', () => messageModal.classList.remove('open'));
    if (closeMessageModalBtn2) closeMessageModalBtn2.addEventListener('click', () => messageModal.classList.remove('open'));

    if (stakeholderMessageForm) {
        stakeholderMessageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const contract = msgContractSelect.value;
            const msg = document.getElementById('msgContent').value.trim();
            messageModal.classList.remove('open');
            stakeholderMessageForm.reset();

            showToast(`Inquiry regarding ${contract} dispatched to ${activeRecipientName}!`, 'success');
        });
    }

    // Stakeholders directory modal
    const viewAllStakeholdersBtn = document.getElementById('viewAllStakeholdersBtn');
    if (viewAllStakeholdersBtn) {
        viewAllStakeholdersBtn.addEventListener('click', (e) => {
            e.preventDefault();
            stakeholdersModal.classList.add('open');
        });
    }
    const manageStakeholdersLink = document.querySelector('a[href="#manage-stakeholders"]');
    if (manageStakeholdersLink) {
        manageStakeholdersLink.addEventListener('click', (e) => {
            e.preventDefault();
            stakeholdersModal.classList.add('open');
        });
    }
    if (closeStakeholdersModalBtn) closeStakeholdersModalBtn.addEventListener('click', () => stakeholdersModal.classList.remove('open'));
    if (closeStakeholdersModalBtn2) closeStakeholdersModalBtn2.addEventListener('click', () => stakeholdersModal.classList.remove('open'));

    // ==================== MODAL: FULL TIMELINE AUDIT ====================
    const viewFullTimelineBtn = document.getElementById('viewFullTimelineBtn');
    if (viewFullTimelineBtn) {
        viewFullTimelineBtn.addEventListener('click', () => {
            fullTimelineContent.innerHTML = auditTimelineEvents.map(ev => `
                <div style="display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid #F1F5F9;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: #6366F1; margin-top: 5px; flex-shrink: 0; box-shadow: 0 0 8px #6366F1;"></div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 700; color: #0F172A; font-size: 0.9rem;">${ev.title}</span>
                            <span style="font-size: 0.72rem; color: #94A3B8;">${ev.time}</span>
                        </div>
                        <p style="font-size: 0.8rem; color: #475569; margin-top: 3px;">${ev.desc}</p>
                    </div>
                </div>
            `).join('');
            timelineModal.classList.add('open');
        });
    }
    if (closeTimelineModalBtn) closeTimelineModalBtn.addEventListener('click', () => timelineModal.classList.remove('open'));
    if (closeTimelineModalBtn2) closeTimelineModalBtn2.addEventListener('click', () => timelineModal.classList.remove('open'));

    // ==================== TOAST NOTIFICATION ====================
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
        toast.innerHTML = `
            <svg style="width: 18px; height: 18px; stroke: ${type === 'error' ? '#EF4444' : '#10B981'};" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                ${type === 'error' ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' : '<polyline points="20 6 9 17 4 12"/>'}
            </svg>
            <span>${escapeHtml(message)}</span>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = 'all 0.3s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // ==================== CONFETTI CELEBRATION BURST ====================
    function launchConfetti() {
        const colors = ['#6366F1', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#06B6D4'];
        const count = 75;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;

            const angle = Math.random() * 2 * Math.PI;
            const distance = 160 + Math.random() * 260;
            const dx = `${Math.cos(angle) * distance}px`;
            const dy = `${Math.sin(angle) * distance}px`;

            particle.style.setProperty('--dx', dx);
            particle.style.setProperty('--dy', dy);

            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1800);
        }
    }

    // Initial load
    loadContracts();
});
