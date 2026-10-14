/**
 * ContractFlow — Application Logic & Micro-Animations
 * Author: Shruti Gupta (Roll No: 23102C0051)
 */

document.addEventListener('DOMContentLoaded', () => {
    // State Store
    let allContracts = [];
    let currentFilter = 'ALL';
    let currentStageFilter = null;
    let selectedContractForReview = null;

    // DOM Elements
    const tableBody = document.getElementById('contractsTableBody');
    const tableRecordCount = document.getElementById('tableRecordCount');
    const globalSearchInput = document.getElementById('globalSearchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const stageNodes = document.querySelectorAll('.step-node');

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

    // Initial Seed Fallback Data (ensures UI is fully functional even before backend compile)
    const fallbackSeeds = [
        { id: 1, contractId: 'CT-101', title: 'Cloud Infrastructure SLA 2026', vendor: 'AWS Corp', category: 'Software & Cloud', amount: 12500.0, dueDate: '2026-11-15', stage: 'INITIATION', status: 'SUBMITTED', description: 'Multi-region cloud hosting and SLA agreement.' },
        { id: 2, contractId: 'CT-102', title: 'Cybersecurity Penetration Audit', vendor: 'CyberSec Shield Ltd', category: 'Security & Compliance', amount: 18000.0, dueDate: '2026-11-20', stage: 'REVIEW', status: 'UNDER_REVIEW', description: 'Comprehensive black-box and grey-box security audit.' },
        { id: 3, contractId: 'CT-103', title: 'Corporate HQ Lease Extension', vendor: 'Prestige Commercial', category: 'Facilities & Real Estate', amount: 65000.0, dueDate: '2027-01-31', stage: 'APPROVAL', status: 'SUBMITTED', description: 'Three-year corporate headquarters facility lease agreement.' },
        { id: 4, contractId: 'CT-104', title: 'Data Analytics & ML Pipeline SOW', vendor: 'DataSoft Innovations', category: 'Professional Services', amount: 34500.0, dueDate: '2026-12-10', stage: 'EXECUTION', status: 'APPROVED', description: 'Production deployment of customer intelligence models.' },
        { id: 5, contractId: 'CT-105', title: 'Employee Health & Wellness Benefits', vendor: 'StarHealth Assurance', category: 'Human Resources', amount: 42000.0, dueDate: '2026-12-31', stage: 'ANALYTICS', status: 'APPROVED', description: 'Group healthcare and wellness policy for 500+ employees.' },
        { id: 6, contractId: 'CT-106', title: 'Enterprise ERP License Renewal', vendor: 'SAP SE', category: 'Enterprise Software', amount: 89000.0, dueDate: '2027-03-31', stage: 'RENEWAL', status: 'APPROVED', description: 'Annual core business ERP software subscription renewal.' },
        { id: 7, contractId: 'CT-107', title: 'Logistics & Freight Master Service', vendor: 'Apex Freight Logistics', category: 'Supply Chain', amount: 28000.0, dueDate: '2026-10-30', stage: 'EXPIRY', status: 'REJECTED', description: 'Nationwide freight and delivery service agreement.' },
        { id: 8, contractId: 'CT-108', title: 'Archived Vendor Confidentiality NDA', vendor: 'InnoLabs Global', category: 'Legal / NDA', amount: 5000.0, dueDate: '2025-05-15', stage: 'ARCHIVED', status: 'APPROVED', description: 'Mutual non-disclosure and intellectual property protection agreement.' }
    ];

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
            console.log('Using local state mode:', err);
            if (allContracts.length === 0) {
                allContracts = [...fallbackSeeds];
            }
        }
        renderTable();
        updateMetrics();
    }

    // ==================== RENDER TABLE ====================
    function renderTable() {
        const query = (globalSearchInput.value || '').toLowerCase().trim();

        const filtered = allContracts.filter(c => {
            // Status Filter
            if (currentFilter !== 'ALL' && c.status !== currentFilter) return false;
            // Stage Stepper Filter
            if (currentStageFilter && c.stage !== currentStageFilter) return false;
            // Search Query
            if (query) {
                const matchId = (c.contractId || '').toLowerCase().includes(query);
                const matchTitle = (c.title || '').toLowerCase().includes(query);
                const matchVendor = (c.vendor || '').toLowerCase().includes(query);
                const matchCategory = (c.category || '').toLowerCase().includes(query);
                if (!matchId && !matchTitle && !matchVendor && !matchCategory) return false;
            }
            return true;
        });

        tableRecordCount.textContent = `${filtered.length} Contract${filtered.length === 1 ? '' : 's'}`;

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: #94A3B8;">
                        <svg style="width: 48px; height: 48px; stroke: #CBD5E1; margin-bottom: 8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <p style="font-weight: 600;">No contracts match your current filters.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = filtered.map(c => {
            const badgeClass = getStatusBadgeClass(c.status);
            const formattedAmount = Number(c.amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            return `
                <tr id="contract-row-${c.contractId}">
                    <td class="text-mono font-bold">${c.contractId}</td>
                    <td style="font-weight: 600; color: #0F172A;">${escapeHtml(c.title)}</td>
                    <td style="color: #475569;">${escapeHtml(c.vendor)}</td>
                    <td><span class="stage-pill">${escapeHtml(c.category)}</span></td>
                    <td class="font-bold text-emerald">${formattedAmount}</td>
                    <td style="color: #64748B;">${c.dueDate || '—'}</td>
                    <td><span class="stage-pill" style="background: rgba(99, 102, 241, 0.08); color: #4338CA; font-weight: 700;">${c.stage}</span></td>
                    <td>
                        <span class="badge ${badgeClass}" id="statusBadge-${c.contractId}">
                            ${formatStatusLabel(c.status)}
                        </span>
                    </td>
                    <td class="text-right">
                        <div class="action-btn-group">
                            <button class="btn-sm btn-review" id="reviewBtn-${c.contractId}" onclick="openReviewModalForId(${c.id})">
                                <svg style="width: 13px; height: 13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                <span>Review</span>
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
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }

    // ==================== UPDATE METRICS & DONUT ====================
    function updateMetrics() {
        const total = allContracts.length;
        const pending = allContracts.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
        const approved = allContracts.filter(c => c.status === 'APPROVED').length;
        const rejected = allContracts.filter(c => c.status === 'REJECTED').length;

        const totalCountElem = document.getElementById('metricTotalCount');
        if (totalCountElem) totalCountElem.textContent = total;

        // Update counts in Stepper
        const stageCounts = {};
        allContracts.forEach(c => {
            stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
        });

        const stages = ['INITIATION', 'REVIEW', 'APPROVAL', 'EXECUTION', 'ANALYTICS', 'RENEWAL', 'EXPIRY', 'ARCHIVED'];
        stages.forEach(s => {
            const el = document.getElementById(`count-${s}`);
            if (el && stageCounts[s] !== undefined) {
                el.textContent = `${stageCounts[s]} Active`;
            }
        });
    }

    // ==================== STEPPER FILTERING ====================
    stageNodes.forEach(node => {
        node.addEventListener('click', () => {
            const stage = node.getAttribute('data-stage');
            if (currentStageFilter === stage) {
                // Toggle off
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

    // ==================== MODAL: CREATE CONTRACT ====================
    newContractBtn.addEventListener('click', () => {
        newContractForm.reset();
        formErrorBanner.classList.add('d-none');
        // Set default date to 30 days from now
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

        // Validation Check
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
                // Fallback mock insert
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

        closeNewContractModal();
        renderTable();
        updateMetrics();
        showToast(`Contract ${payload.title} created successfully!`, 'success');
    });

    // ==================== MODAL: REVIEW CONTRACT ====================
    window.openReviewModalForId = function(id) {
        const contract = allContracts.find(c => c.id === id);
        if (!contract) return;
        selectedContractForReview = contract;

        document.getElementById('reviewDetailId').textContent = contract.contractId;
        document.getElementById('reviewDetailVendor').textContent = contract.vendor;
        document.getElementById('reviewDetailAmount').textContent = Number(contract.amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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
                updateContractLocally(id, 'APPROVED', notes);
            }
        } catch (e) {
            updateContractLocally(id, 'APPROVED', notes);
        }

        // Trigger celebratory confetti animation!
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
                updateContractLocally(id, 'REJECTED', notes);
            }
        } catch (e) {
            updateContractLocally(id, 'REJECTED', notes);
        }

        closeReviewModal();
        renderTable();
        updateMetrics();
        showToast(`Contract ${selectedContractForReview.contractId} Rejected.`, 'error');
    });

    function updateContractLocally(id, status, notes) {
        const item = allContracts.find(c => c.id === id);
        if (item) {
            item.status = status;
            item.reviewerNotes = notes;
            if (status === 'APPROVED') item.stage = 'EXECUTION';
        }
    }

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

    // ==================== HUGE CONFETTI BURST ANIMATION ====================
    function launchConfetti() {
        const colors = ['#6366F1', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#06B6D4'];
        const count = 70;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;

            const angle = Math.random() * 2 * Math.PI;
            const distance = 150 + Math.random() * 250;
            const dx = `${Math.cos(angle) * distance}px`;
            const dy = `${Math.sin(angle) * distance}px`;

            particle.style.setProperty('--dx', dx);
            particle.style.setProperty('--dy', dy);

            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1800);
        }
    }

    // Load contracts on start
    loadContracts();
});
