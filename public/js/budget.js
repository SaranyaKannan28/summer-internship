// Current month tracking
let currentMonthOffset = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBudgetData();
    initializeBudgetForm();
});

// Initialize form
const initializeBudgetForm = () => {
    const form = document.getElementById('budgetForm');
    if (form) {
        // Set default month to current month
        const today = new Date();
        const monthString = today.toISOString().substring(0, 7);
        document.getElementById('budgetMonth').value = monthString;

        form.addEventListener('submit', handleBudgetSubmit);
    }
};

// Handle form submission
const handleBudgetSubmit = async (e) => {
    e.preventDefault();

    const month = document.getElementById('budgetMonth').value;
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    const department = document.getElementById('budgetDepartment').value;
    const notes = document.getElementById('budgetNotes').value;

    try {
        // Save to localStorage (you can change this to API call)
        const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
        const key = department ? `${month}-${department}` : month;
        
        budgets[key] = {
            month,
            amount,
            department: department || 'All',
            notes,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('budgets', JSON.stringify(budgets));

        showAlert('success', 'Budget saved successfully!');
        closeBudgetModal();
        loadBudgetData();
    } catch (error) {
        showAlert('error', 'Failed to save budget: ' + error.message);
    }
};

// Load all budget data
const loadBudgetData = async () => {
    await loadBudgetOverview();
    loadCurrentMonthBudget();
    loadDepartmentBudgets();
    loadBudgetForecast();
    loadBudgetHistory();
};

// Load budget overview
const loadBudgetOverview = async () => {
    try {
        const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
        const salaries = await fetchSalaries();

        const currentYear = new Date().getFullYear();
        
        // Calculate annual budget
        let annualBudget = 0;
        Object.values(budgets).forEach(b => {
            if (b.month.startsWith(currentYear.toString())) {
                annualBudget += b.amount;
            }
        });

        // Calculate YTD spending
        const ytdSpent = salaries
            .filter(s => new Date(s.paidOn).getFullYear() === currentYear)
            .reduce((sum, s) => sum + parseFloat(s.amount), 0);

        const remaining = annualBudget - ytdSpent;
        const utilization = annualBudget > 0 ? (ytdSpent / annualBudget * 100).toFixed(1) : 0;

        document.getElementById('totalBudget').textContent = formatCurrency(annualBudget);
        document.getElementById('totalSpent').textContent = formatCurrency(ytdSpent);
        document.getElementById('totalRemaining').textContent = formatCurrency(remaining);
        document.getElementById('utilizationPercent').textContent = `${utilization}%`;
    } catch (error) {
        console.error('Error loading budget overview:', error);
    }
};

// Load current month budget
const loadCurrentMonthBudget = async () => {
    try {
        const date = new Date();
        date.setMonth(date.getMonth() + currentMonthOffset);
        
        const monthString = date.toISOString().substring(0, 7);
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        document.getElementById('currentMonthYear').textContent = monthName;

        const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
        const budget = budgets[monthString]?.amount || 0;

        const salaries = await fetchSalaries();
        const monthSpent = salaries
            .filter(s => {
                const sDate = new Date(s.paidOn);
                return sDate.getMonth() === date.getMonth() && sDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, s) => sum + parseFloat(s.amount), 0);

        const remaining = budget - monthSpent;
        const utilization = budget > 0 ? (monthSpent / budget * 100).toFixed(1) : 0;

        document.getElementById('currentMonthBudget').textContent = formatCurrency(budget);
        document.getElementById('currentMonthSpent').textContent = formatCurrency(monthSpent);
        document.getElementById('currentMonthRemaining').textContent = formatCurrency(remaining);
        
        const progressBar = document.getElementById('monthProgressBar');
        const progressText = document.getElementById('monthProgressText');
        progressBar.style.width = `${Math.min(utilization, 100)}%`;
        progressText.textContent = `${utilization}%`;

        // Update status
        const statusEl = document.getElementById('currentMonthStatus');
        let statusClass = 'on-track';
        let statusText = 'On Track';

        if (utilization > 100) {
            statusClass = 'over-budget';
            statusText = 'Over Budget';
            progressBar.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
        } else if (utilization > 80) {
            statusClass = 'warning';
            statusText = 'Warning';
            progressBar.style.background = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
        } else {
            progressBar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }

        statusEl.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;
    } catch (error) {
        console.error('Error loading current month budget:', error);
    }
};

// Change month
const changeMonth = (offset) => {
    currentMonthOffset += offset;
    loadCurrentMonthBudget();
};

// Load department budgets
const loadDepartmentBudgets = async () => {
    try {
        const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
        const salaries = await fetchSalaries();
        const currentMonth = new Date().toISOString().substring(0, 7);

        const departments = ['IT', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations'];
        const tbody = document.getElementById('departmentBudgetBody');

        const rows = departments.map(dept => {
            const key = `${currentMonth}-${dept}`;
            const budget = budgets[key]?.amount || 0;
            
            // In a real app, you'd filter salaries by department
            // For now, we'll divide equally for demonstration
            const spent = 0; // Placeholder
            const remaining = budget - spent;
            const utilization = budget > 0 ? ((spent / budget) * 100).toFixed(1) : 0;
            
            let statusClass = 'on-track';
            let statusText = 'On Track';
            if (utilization > 100) {
                statusClass = 'over-budget';
                statusText = 'Over Budget';
            } else if (utilization > 80) {
                statusClass = 'warning';
                statusText = 'Warning';
            }

            return `
                <tr>
                    <td>${dept}</td>
                    <td>${formatCurrency(budget)}</td>
                    <td>${formatCurrency(spent)}</td>
                    <td>${formatCurrency(remaining)}</td>
                    <td>
                        <div class="progress-bar" style="height: 20px; width: 150px;">
                            <div class="progress-fill" style="width: ${Math.min(utilization, 100)}%">
                                ${utilization}%
                            </div>
                        </div>
                    </td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-edit" onclick="editDepartmentBudget('${dept}')">Edit</button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows || '<tr><td colspan="7" class="loading-cell">No department budgets set</td></tr>';
    } catch (error) {
        console.error('Error loading department budgets:', error);
    }
};

// Load budget forecast
const loadBudgetForecast = async () => {
    try {
        const salaries = await fetchSalaries();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        // Calculate last 3 months average
        const last3MonthsData = [];
        for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setMonth(currentMonth - i);
            
            const monthSpent = salaries
                .filter(s => {
                    const sDate = new Date(s.paidOn);
                    return sDate.getMonth() === date.getMonth() && sDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, s) => sum + parseFloat(s.amount), 0);
            
            last3MonthsData.push(monthSpent);
        }

        const avgMonthlySpend = last3MonthsData.reduce((sum, v) => sum + v, 0) / 3;
        const remainingMonths = 12 - (currentMonth + 1);
        const projectedSpending = avgMonthlySpend * remainingMonths;

        const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
        let annualBudget = 0;
        Object.values(budgets).forEach(b => {
            if (b.month.startsWith(currentYear.toString())) {
                annualBudget += b.amount;
            }
        });

        const ytdSpent = salaries
            .filter(s => new Date(s.paidOn).getFullYear() === currentYear)
            .reduce((sum, s) => sum + parseFloat(s.amount), 0);

        const expectedVariance = (ytdSpent + projectedSpending) - annualBudget;
        const burnRate = annualBudget > 0 ? (ytdSpent / annualBudget * 100).toFixed(1) : 0;

        document.getElementById('projectedSpending').textContent = formatCurrency(ytdSpent + projectedSpending);
        document.getElementById('expectedVariance').textContent = formatCurrency(Math.abs(expectedVariance));
        document.getElementById('avgMonthlySpend').textContent = formatCurrency(avgMonthlySpend);
        document.getElementById('burnRate').textContent = `${burnRate}%`;

        const varianceLabel = document.getElementById('varianceLabel');
        if (expectedVariance > 0) {
            varianceLabel.textContent = 'Over budget';
            varianceLabel.style.color = '#dc3545';
        } else {
            varianceLabel.textContent = 'Within budget';
            varianceLabel.style.color = '#28a745';
        }
    } catch (error) {
        console.error('Error loading forecast:', error);
    }
};

// Load budget history
const loadBudgetHistory = async () => {
    try {
        const salaries = await fetchSalaries();
        const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
        
        const monthlyData = getMonthlyData(salaries).slice(-6);
        const tbody = document.getElementById('budgetHistoryBody');

        const rows = monthlyData.map(m => {
            const budget = budgets[m.month]?.amount || 0;
            const variance = m.totalAmount - budget;
            const utilization = budget > 0 ? ((m.totalAmount / budget) * 100).toFixed(1) : 0;
            
            let statusClass = 'on-track';
            let statusText = 'On Track';
            if (variance > 0) {
                statusClass = 'over-budget';
                statusText = 'Over Budget';
            } else if (utilization > 80) {
                statusClass = 'warning';
                statusText = 'Near Limit';
            }

            return `
                <tr>
                    <td>${m.month}</td>
                    <td>${formatCurrency(budget)}</td>
                    <td>${formatCurrency(m.totalAmount)}</td>
                    <td style="color: ${variance >= 0 ? '#dc3545' : '#28a745'}">
                        ${variance >= 0 ? '+' : ''}${formatCurrency(variance)}
                    </td>
                    <td>${utilization}%</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows || '<tr><td colspan="6" class="loading-cell">No history available</td></tr>';
    } catch (error) {
        console.error('Error loading history:', error);
    }
};

// Modal functions
const openBudgetModal = () => {
    document.getElementById('budgetModal').classList.add('active');
};

const closeBudgetModal = () => {
    document.getElementById('budgetModal').classList.remove('active');
    document.getElementById('budgetForm').reset();
};

const editDepartmentBudget = (department) => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    document.getElementById('budgetMonth').value = currentMonth;
    document.getElementById('budgetDepartment').value = department;
    
    const budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
    const key = `${currentMonth}-${department}`;
    const budget = budgets[key];
    
    if (budget) {
        document.getElementById('budgetAmount').value = budget.amount;
        document.getElementById('budgetNotes').value = budget.notes || '';
    }
    
    openBudgetModal();
};

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('budgetModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBudgetModal();
            }
        });
    }
});