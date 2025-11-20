// Global variables
let isEditMode = false;
let allSalaries = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadSalaries();
    initializeForm();
});

// Initialize form submission
const initializeForm = () => {
    const form = document.getElementById('salaryForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
};

// Handle form submission
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
        showAlert('error', error.message);
    }
};

// Load all salaries
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

// Display salaries in table
const displaySalaries = (salaries) => {
    const tbody = document.getElementById('salaryTableBody');

    if (!salaries || salaries.length === 0) {
        showEmptyState(true);
        return;
    }

    showEmptyState(false);
    document.getElementById('tableWrapper').style.display = 'block';

    tbody.innerHTML = salaries.map(salary => `
        <tr>
            <td>${salary.id}</td>
            <td><span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${salary.type}</span></td>
            <td><strong>${formatCurrency(salary.amount)}</strong></td>
            <td>${salary.paidTo}</td>
            <td>${formatDate(salary.paidOn)}</td>
            <td>${salary.paidThrough}</td>
            <td>${formatDate(salary.startDate)} - ${formatDate(salary.endDate)}</td>
            <td>${salary.remarks || '-'}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-edit" onclick="editSalary(${salary.id})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteSalary(${salary.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
};

// Open modal for adding
const openModal = () => {
    resetForm();
    document.getElementById('salaryModal').classList.add('active');
};

// Close modal
const closeModal = () => {
    document.getElementById('salaryModal').classList.remove('active');
    resetForm();
};

// Edit salary
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

// Delete salary
const deleteSalary = async (id) => {
    if (!confirm('Are you sure you want to delete this salary record?')) {
        return;
    }

    try {
        await deleteSalaryAPI(id);
        showAlert('success', 'Salary deleted successfully!');
        loadSalaries();
    } catch (error) {
        showAlert('error', error.message);
    }
};

// Apply filters
const applyFilters = () => {
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;
    const type = document.getElementById('filterType').value;
    const employee = document.getElementById('filterEmployee').value.toLowerCase();

    let filtered = [...allSalaries];

    // Filter by date range
    if (startDate && endDate) {
        filtered = filtered.filter(s => {
            const paidDate = new Date(s.paidOn);
            return paidDate >= new Date(startDate) && paidDate <= new Date(endDate);
        });
    }

    // Filter by type
    if (type) {
        filtered = filtered.filter(s => s.type === type);
    }

    // Filter by employee
    if (employee) {
        filtered = filtered.filter(s => s.paidTo.toLowerCase().includes(employee));
    }

    displaySalaries(filtered);
};

// Clear filters
const clearFilters = () => {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterEmployee').value = '';
    displaySalaries(allSalaries);
};

// Reset form
const resetForm = () => {
    document.getElementById('salaryForm').reset();
    document.getElementById('salaryId').value = '';
    isEditMode = false;
    document.getElementById('modalTitle').textContent = 'Add New Salary';
    document.getElementById('submitBtn').textContent = 'Add Salary';
};

// Show empty state
const showEmptyState = (show) => {
    document.getElementById('emptyState').style.display = show ? 'block' : 'none';
    document.getElementById('tableWrapper').style.display = show ? 'none' : 'block';
};

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('salaryModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});