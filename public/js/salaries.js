import {
    fetchSalaries,
    createSalary,
    updateSalaryAPI,
    deleteSalaryAPI,
    fetchProfile
} from "./common.js";



// =========================
// Global variables
// =========================
let isEditMode = false;
let allSalaries = [];

// =========================
// Initialize page
// =========================
document.addEventListener('DOMContentLoaded', () => {
    loadSalaries();
    initializeForm();
    initializeModalCloser();
});

// =========================
// Initialize form submission
// =========================
const initializeForm = () => {
    const form = document.getElementById('salaryForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
};

// =========================
// Handle form submit
// =========================
const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = {
        type: document.getElementById('type').value,
        amount: parseFloat(document.getElementById('amount').value),
        paidTo: document.getElementById('paidTo').value,
        paidOn: document.getElementById('paidOn').value,
        paidThrough: document.getElementById('paidThrough').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        remarks: document.getElementById('remarks').value
    };

    try {
        const salaryId = document.getElementById('salaryId').value;

        if (isEditMode && salaryId) {
            await updateSalaryAPI(salaryId, formData);
            showAlert('success', 'Salary updated successfully!');
        } else {
            await createSalary(formData);
            showAlert('success', 'Salary added successfully!');
        }

        closeModal();
        resetForm();
        loadSalaries();
    } catch (error) {
        showAlert('error', error.message || 'Error occurred');
    }
};

// =========================
// Load salaries
// =========================
const loadSalaries = async () => {
    showLoading('loadingState', true);
    document.getElementById('tableWrapper').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';

    try {
        allSalaries = await fetchSalaries();
        displaySalaries(allSalaries);
    } catch (error) {
        showAlert('error', 'Failed to load salaries');
        showEmptyState(true);
    } finally {
        showLoading('loadingState', false);
    }
};

// =========================
// Display salaries
// =========================
const displaySalaries = (salaries) => {
    const tbody = document.getElementById('salaryTableBody');

    if (!salaries || salaries.length === 0) {
        showEmptyState(true);
        return;
    }

    showEmptyState(false);
    document.getElementById('tableWrapper').style.display = 'block';

    tbody.innerHTML = salaries
        .map(
            (salary) => `
        <tr>
            <td>${salary.id}</td>
            <td><span class="tag">${salary.type}</span></td>
            <td><strong>${formatCurrency(salary.amount)}</strong></td>
            <td>${salary.paidTo}</td>
            <td>${formatDate(salary.paidOn)}</td>
            <td>${salary.paidThrough}</td>
            <td>${formatDate(salary.startDate)} - ${formatDate(salary.endDate)}</td>
            <td>${salary.remarks || '-'}</td>
            <td>
                <button class="btn btn-edit" onclick="editSalary(${salary.id})">Edit</button>
                <button class="btn btn-delete" onclick="deleteSalary(${salary.id})">Delete</button>
            </td>
        </tr>
    `
        )
        .join('');
};

// =========================
// Modal controls
// =========================
const openModal = () => {
    resetForm();
    document.getElementById('salaryModal').classList.add('active');
};

const closeModal = () => {
    document.getElementById('salaryModal').classList.remove('active');
    resetForm();
};

const initializeModalCloser = () => {
    const modal = document.getElementById('salaryModal');
    if (!modal) return;

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
};

// =========================
// Edit Salary
// =========================
const editSalary = async (id) => {
    try {
        const salary = await fetchSalaryById(id);

        document.getElementById('salaryId').value = salary.id;
        document.getElementById('type').value = salary.type;
        document.getElementById('amount').value = salary.amount;
        document.getElementById('paidTo').value = salary.paidTo;
        document.getElementById('paidOn').value = salary.paidOn;
        document.getElementById('paidThrough').value = salary.paidThrough;
        document.getElementById('startDate').value = salary.startDate;
        document.getElementById('endDate').value = salary.endDate;
        document.getElementById('remarks').value = salary.remarks || '';

        isEditMode = true;
        document.getElementById('modalTitle').textContent = 'Edit Salary';
        document.getElementById('submitBtn').textContent = 'Update Salary';

        document.getElementById('salaryModal').classList.add('active');
    } catch (error) {
        showAlert('error', 'Failed to load salary details');
    }
};

// =========================
// Delete Salary
// =========================
const deleteSalary = async (id) => {
    if (!confirm('Are you sure you want to delete this salary record?')) return;

    try {
        await deleteSalaryAPI(id);
        showAlert('success', 'Salary deleted successfully!');
        loadSalaries();
    } catch (error) {
        showAlert('error', error.message);
    }
};

// =========================
// Apply Filters
// =========================
// Replace the existing applyFilters() with this
const applyFilters = () => {
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;
    const type = document.getElementById('filterType').value;
    const employee = document.getElementById('filterEmployee').value.trim().toLowerCase();

    let filtered = [...allSalaries];

    if (startDate && endDate) {
        filtered = filtered.filter((s) => {
            const paidDate = new Date(s.paidOn);
            return paidDate >= new Date(startDate) && paidDate <= new Date(endDate);
        });
    }

    if (type) filtered = filtered.filter((s) => s.type === type);

    if (employee) {
        // If user enters a numeric value (id), filter by userId
        const maybeId = Number(employee);
        if (!Number.isNaN(maybeId) && String(maybeId) === employee) {
            filtered = filtered.filter((s) => Number(s.userId) === maybeId);
        } else {
            // otherwise fallback to name search on paidTo
            filtered = filtered.filter((s) =>
                s.paidTo && s.paidTo.toLowerCase().includes(employee)
            );
        }
    }

    displaySalaries(filtered);
};

const clearFilters = () => {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterEmployee').value = '';

    displaySalaries(allSalaries);
};

// =========================
// Reset Form
// =========================
const resetForm = () => {
    document.getElementById('salaryForm').reset();
    document.getElementById('salaryId').value = '';
    isEditMode = false;

    document.getElementById('modalTitle').textContent = 'Add New Salary';
    document.getElementById('submitBtn').textContent = 'Add Salary';
};

// =========================
// Empty State
// =========================
const showEmptyState = (show) => {
    document.getElementById('emptyState').style.display = show ? 'block' : 'none';
    document.getElementById('tableWrapper').style.display = show ? 'none' : 'block';
};

// =========================
// Loading State
// =========================
function showLoading(id, show) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'block' : 'none';
}

// =========================
// Utility Functions
// =========================
const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');
const formatCurrency = (amt) =>
    amt ? `₹${amt.toLocaleString('en-IN')}` : '₹0';

// =========================
// ⭐ ALERT SYSTEM (Working)
// =========================
function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    alert.innerHTML = `<span>${message}</span>`;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.classList.add('hide');
        setTimeout(() => alert.remove(), 300);
    }, 2000);
}
window.openModal = openModal;
window.closeModal = closeModal;
window.editSalary = editSalary;
window.deleteSalary = deleteSalary;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
