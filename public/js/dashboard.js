// Dashboard initialization
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    loadUpcomingPayments();
    loadTopEmployees();
    loadBudgetOverview();
    loadPaymentMethods();
    loadYoYComparison();
    loadGrowthTrend();
});

// Load all dashboard data
const loadDashboardData = async () => {
    try {
        const salaries = await fetchSalaries();
        updateStatistics(salaries);
        loadRecentSalaries(salaries);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('error', 'Failed to load dashboard data');
    }
};

// Update statistics cards with year-over-year comparison
const updateStatistics = (salaries) => {
    const stats = calculateStats(salaries);
    
    // Get last year's data for comparison
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    const lastYearSalaries = salaries.filter(s => {
        const date = new Date(s.paidOn);
        return date.getFullYear() === lastYear.getFullYear();
    });
    const lastYearStats = calculateStats(lastYearSalaries);
    
    // Total salaries paid
    document.getElementById('totalSalaries').textContent = formatCurrency(stats.total);
    const totalChange = lastYearStats.total > 0 ? 
        ((stats.total - lastYearStats.total) / lastYearStats.total * 100).toFixed(1) : 0;
    document.getElementById('totalChange').textContent = `${totalChange >= 0 ? '+' : ''}${totalChange}% YoY`;
    document.getElementById('totalChange').className = `stat-change ${totalChange >= 0 ? 'positive' : 'negative'}`;

    // Total employees
    document.getElementById('totalEmployees').textContent = stats.uniqueEmployees;
    const empChange = stats.uniqueEmployees - lastYearStats.uniqueEmployees;
    document.getElementById('employeeChange').textContent = `${empChange >= 0 ? '+' : ''}${empChange}`;

    // Total records
    document.getElementById('totalRecords').textContent = stats.count;
    const recordsChange = stats.count - lastYearStats.count;
    document.getElementById('recordsChange').textContent = `${recordsChange >= 0 ? '+' : ''}${recordsChange}`;

    // This month's payments
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthPayments = salaries.filter(s => {
        const date = new Date(s.paidOn);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonthPayments = salaries.filter(s => {
        const date = new Date(s.paidOn);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    });

    const thisMonthTotal = thisMonthPayments.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const lastMonthTotal = lastMonthPayments.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    
    document.getElementById('thisMonth').textContent = formatCurrency(thisMonthTotal);
    const monthChange = lastMonthTotal > 0 ? 
        ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : 0;
    document.getElementById('monthChange').textContent = `${monthChange >= 0 ? '+' : ''}${monthChange}% MoM`;
    document.getElementById('monthChange').className = `stat-change ${monthChange >= 0 ? 'positive' : 'negative'}`;
};

// Load upcoming payments
const loadUpcomingPayments = async () => {
    try {
        const days = parseInt(document.getElementById('upcomingPeriod')?.value || 30);
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        const salaries = await fetchSalaries();
        
        // Filter payments within the period
        const upcoming = salaries.filter(s => {
            const paidDate = new Date(s.paidOn);
            return paidDate >= today && paidDate <= futureDate;
        }).sort((a, b) => new Date(a.paidOn) - new Date(b.paidOn)).slice(0, 5);

        const container = document.getElementById('upcomingPayments');
        
        if (upcoming.length === 0) {
            container.innerHTML = '<p class="loading-text">No upcoming payments</p>';
            return;
        }

        container.innerHTML = `
            <div class="upcoming-list">
                ${upcoming.map(s => `
                    <div class="upcoming-item">
                        <div class="upcoming-info">
                            <h4>${s.paidTo}</h4>
                            <p>${formatDate(s.paidOn)} • ${s.type}</p>
                        </div>
                        <div class="upcoming-amount">${formatCurrency(s.amount)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        document.getElementById('upcomingPayments').innerHTML = '<p class="loading-text">Error loading data</p>';
    }
};

// Load top paid employees
const loadTopEmployees = async () => {
    try {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const salaries = await fetchSalaries();
        const thisMonthSalaries = salaries.filter(s => {
            const date = new Date(s.paidOn);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const employeeData = groupByEmployee(thisMonthSalaries);
        const top5 = employeeData.slice(0, 5);

        const container = document.getElementById('topEmployees');
        
        if (top5.length === 0) {
            container.innerHTML = '<p class="loading-text">No data for current month</p>';
            return;
        }

        container.innerHTML = `
            <div class="employee-rank-list">
                ${top5.map((emp, index) => `
                    <div class="employee-rank-item">
                        <div class="rank-badge">${index + 1}</div>
                        <div class="employee-rank-info">
                            <h4>${emp.name}</h4>
                            <p>${emp.count} payment${emp.count > 1 ? 's' : ''}</p>
                        </div>
                        <div class="employee-rank-amount">${formatCurrency(emp.totalAmount)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        document.getElementById('topEmployees').innerHTML = '<p class="loading-text">Error loading data</p>';
    }
};

// Load budget overview
const loadBudgetOverview = () => {
    try {
        // Get budget from localStorage (you can change this to API call)
        const budgetData = JSON.parse(localStorage.getItem('monthlyBudget') || '{}');
        const currentMonth = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' });
        const budget = budgetData[currentMonth] || 100000; // Default budget

        // Get current month spending
        fetchSalaries().then(salaries => {
            const month = new Date().getMonth();
            const year = new Date().getFullYear();
            
            const monthlySpent = salaries
                .filter(s => {
                    const date = new Date(s.paidOn);
                    return date.getMonth() === month && date.getFullYear() === year;
                })
                .reduce((sum, s) => sum + parseFloat(s.amount), 0);

            const remaining = budget - monthlySpent;
            const utilization = (monthlySpent / budget * 100).toFixed(1);

            document.getElementById('monthlyBudget').textContent = formatCurrency(budget);
            document.getElementById('monthlySpent').textContent = formatCurrency(monthlySpent);
            document.getElementById('monthlyRemaining').textContent = formatCurrency(remaining);
            document.getElementById('budgetUtilization').textContent = `${utilization}%`;

            const progressBar = document.getElementById('budgetProgressBar');
            progressBar.style.width = `${Math.min(utilization, 100)}%`;
            
            if (utilization > 100) {
                progressBar.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
            } else if (utilization > 80) {
                progressBar.style.background = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
            }
        });
    } catch (error) {
        console.error('Error loading budget:', error);
    }
};

// Load payment methods chart
const loadPaymentMethods = async () => {
    try {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const salaries = await fetchSalaries();
        const monthSalaries = salaries.filter(s => {
            const date = new Date(s.paidOn);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const methods = groupByMethod(monthSalaries);
        const total = Object.values(methods).reduce((sum, m) => sum + m.count, 0);

        const container = document.getElementById('methodsChart');
        const colors = {
            'Bank Transfer': '#667eea',
            'Cash': '#28a745',
            'Cheque': '#ffc107',
            'UPI': '#17a2b8'
        };

        container.innerHTML = `
            <div class="mini-chart">
                ${Object.values(methods).map(method => {
                    const percent = total > 0 ? (method.count / total * 100).toFixed(1) : 0;
                    return `
                        <div class="chart-bar-item">
                            <div class="chart-bar-label">${method.method}</div>
                            <div class="chart-bar-container-small">
                                <div class="chart-bar-fill" style="width: ${percent}%; background: ${colors[method.method] || '#667eea'}">
                                    ${method.count}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (error) {
        document.getElementById('methodsChart').innerHTML = '<p class="loading-text">Error loading data</p>';
    }
};

// Load year-over-year comparison
const loadYoYComparison = async () => {
    try {
        const salaries = await fetchSalaries();
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;

        const currentYearData = salaries.filter(s => new Date(s.paidOn).getFullYear() === currentYear);
        const lastYearData = salaries.filter(s => new Date(s.paidOn).getFullYear() === lastYear);

        const currentTotal = currentYearData.reduce((sum, s) => sum + parseFloat(s.amount), 0);
        const lastTotal = lastYearData.reduce((sum, s) => sum + parseFloat(s.amount), 0);

        const currentAvg = currentYearData.length > 0 ? currentTotal / currentYearData.length : 0;
        const lastAvg = lastYearData.length > 0 ? lastTotal / lastYearData.length : 0;

        const change = lastAvg > 0 ? ((currentAvg - lastAvg) / lastAvg * 100).toFixed(1) : 0;

        const container = document.getElementById('yoyChart');
        container.innerHTML = `
            <div class="comparison-chart">
                <div class="comparison-item">
                    <div class="comparison-year">${lastYear}</div>
                    <div class="comparison-value">${formatCurrency(lastAvg)}</div>
                    <div class="comparison-change">Baseline Year</div>
                </div>
                <div class="comparison-item">
                    <div class="comparison-year">${currentYear}</div>
                    <div class="comparison-value">${formatCurrency(currentAvg)}</div>
                    <div class="comparison-change ${change >= 0 ? 'positive' : 'negative'}">
                        ${change >= 0 ? '↑' : '↓'} ${Math.abs(change)}%
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('yoyChart').innerHTML = '<p class="loading-text">Error loading data</p>';
    }
};

// Load growth trend
const loadGrowthTrend = async () => {
    try {
        const salaries = await fetchSalaries();
        const monthlyData = getMonthlyData(salaries).slice(-6);

        if (monthlyData.length === 0) {
            document.getElementById('growthChart').innerHTML = '<p class="loading-text">No data available</p>';
            return;
        }

        const maxAmount = Math.max(...monthlyData.map(m => m.totalAmount));

        const container = document.getElementById('growthChart');
        container.innerHTML = `
            <div class="trend-chart">
                ${monthlyData.map(m => {
                    const heightPercent = maxAmount > 0 ? (m.totalAmount / maxAmount) : 0;
                    const height = Math.max(heightPercent * 150, 30);
                    return `
                        <div class="trend-bar-item">
                            <div class="trend-bar-fill" style="height: ${height}px">
                                ${formatCurrency(m.totalAmount / 1000)}K
                            </div>
                            <div class="trend-bar-label">${m.month.substring(5)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (error) {
        document.getElementById('growthChart').innerHTML = '<p class="loading-text">Error loading data</p>';
    }
};

// Load recent salaries (last 5)
const loadRecentSalaries = (salaries) => {
    const tbody = document.getElementById('recentTableBody');
    if (!tbody) return;

    if (!salaries || salaries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    No salary records found
                </td>
            </tr>
        `;
        return;
    }

    // Sort by date (newest first) and take first 5
    const recentSalaries = salaries
        .sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn))
        .slice(0, 5);

    tbody.innerHTML = recentSalaries.map(salary => {
        const isPast = new Date(salary.paidOn) < new Date();
        return `
        <tr>
            <td>${formatDate(salary.paidOn)}</td>
            <td>${salary.paidTo}</td>
            <td><span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${salary.type}</span></td>
            <td><strong>${formatCurrency(salary.amount)}</strong></td>
            <td>${salary.paidThrough}</td>
            <td><span class="status-badge ${isPast ? 'on-track' : 'warning'}">${isPast ? 'Completed' : 'Pending'}</span></td>
        </tr>
    `}).join('');
};