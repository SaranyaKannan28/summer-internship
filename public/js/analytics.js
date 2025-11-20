// Load analytics
const loadAnalytics = async () => {
    const startDate = document.getElementById('analyticsStartDate').value;
    const endDate = document.getElementById('analyticsEndDate').value;

    if (!startDate || !endDate) {
        showAlert('error', 'Please select both start and end dates');
        return;
    }

    try {
        const salaries = await fetchSalaries(startDate, endDate);

        if (!salaries || salaries.length === 0) {
            showAlert('error', 'No data found for the selected period');
            return;
        }

        updateMetrics(salaries);
        updateCharts(salaries);
        updateTopEmployees(salaries);
        updateMonthlyTrend(salaries);

        showAlert('success', 'Analytics loaded successfully!');
    } catch (error) {
        showAlert('error', 'Failed to load analytics: ' + error.message);
    }
};

// Update key metrics
const updateMetrics = (salaries) => {
    const stats = calculateStats(salaries);

    document.getElementById('analyticsTotalAmount').textContent = formatCurrency(stats.total);
    document.getElementById('analyticsHighest').textContent = formatCurrency(stats.highest);
    document.getElementById('analyticsLowest').textContent = formatCurrency(stats.lowest);
    document.getElementById('analyticsAverage').textContent = formatCurrency(stats.average);
};

// Update charts
const updateCharts = (salaries) => {
    updateTypeChart(salaries);
    updateMethodChart(salaries);
};

// Update salary type chart
const updateTypeChart = (salaries) => {
    const typeData = groupByType(salaries);
    const total = salaries.length;

    Object.keys(typeData).forEach(type => {
        const percentage = (typeData[type].count / total) * 100;
        const bar = document.querySelector(`[data-type="${type}"]`);
        const value = document.querySelector(`[data-value="${type}"]`);

        if (bar && value) {
            setTimeout(() => {
                bar.style.width = percentage + '%';
            }, 100);
            value.textContent = typeData[type].count;
        }
    });
};

// Update payment method chart
const updateMethodChart = (salaries) => {
    const methodData = groupByMethod(salaries);
    const total = salaries.length;

    Object.keys(methodData).forEach(method => {
        const percentage = (methodData[method].count / total) * 100;
        const bar = document.querySelector(`[data-method="${method}"]`);
        const value = document.querySelector(`[data-value="${method}"]`);

        if (bar && value) {
            setTimeout(() => {
                bar.style.width = percentage + '%';
            }, 100);
            value.textContent = methodData[method].count;
        }
    });
};

// Update top employees table
const updateTopEmployees = (salaries) => {
    const employeeData = groupByEmployee(salaries);
    const top10 = employeeData.slice(0, 10);
    const tbody = document.getElementById('topEmployeesBody');

    tbody.innerHTML = top10.map((emp, index) => `
        <tr>
            <td><strong>#${index + 1}</strong></td>
            <td>${emp.name}</td>
            <td><strong>${formatCurrency(emp.totalAmount)}</strong></td>
            <td>${emp.count}</td>
            <td>${formatCurrency(emp.totalAmount / emp.count)}</td>
        </tr>
    `).join('');
};

// Update monthly trend
const updateMonthlyTrend = (salaries) => {
    const monthlyData = getMonthlyData(salaries);
    const container = document.getElementById('monthlyTrend');

    if (!monthlyData || monthlyData.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No monthly data available</p>';
        return;
    }

    // Find max value for scaling
    const maxAmount = Math.max(...monthlyData.map(m => m.totalAmount));

    // Format month names
    const formatMonthLabel = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    };

    container.innerHTML = `
        <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 350px; padding: 20px 10px; gap: 15px; overflow-x: auto;">
            ${monthlyData.map(m => {
                const heightPercent = maxAmount > 0 ? (m.totalAmount / maxAmount) * 100 : 0;
                const barHeight = Math.max(heightPercent, 5); // Minimum 5% height for visibility
                
                return `
                    <div style="
                        display: flex; 
                        flex-direction: column; 
                        align-items: center; 
                        flex: 1; 
                        min-width: 80px;
                        max-width: 120px;
                    ">
                        <div style="
                            font-size: 11px; 
                            font-weight: 600; 
                            color: #667eea; 
                            margin-bottom: 8px;
                            text-align: center;
                            word-wrap: break-word;
                        ">
                            ${formatCurrency(m.totalAmount)}
                        </div>
                        <div style="
                            width: 100%;
                            height: ${barHeight}%;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-radius: 8px 8px 0 0;
                            transition: all 0.8s ease;
                            min-height: 30px;
                            box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
                            position: relative;
                        ">
                            <div style="
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                color: white;
                                font-size: 10px;
                                font-weight: bold;
                            ">
                                ${m.count}
                            </div>
                        </div>
                        <div style="
                            font-size: 12px; 
                            color: #333; 
                            margin-top: 10px;
                            font-weight: 600;
                            text-align: center;
                        ">
                            ${formatMonthLabel(m.month)}
                        </div>
                        <div style="
                            font-size: 10px; 
                            color: #999; 
                            margin-top: 2px;
                            text-align: center;
                        ">
                            ${m.count} payment${m.count !== 1 ? 's' : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    // Trigger animation after a brief delay
    setTimeout(() => {
        const bars = container.querySelectorAll('div[style*="height:"]');
        bars.forEach(bar => {
            if (bar.style.height) {
                bar.style.opacity = '1';
            }
        });
    }, 100);
};

// Set default dates (last 6 months)
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    document.getElementById('analyticsStartDate').valueAsDate = sixMonthsAgo;
    document.getElementById('analyticsEndDate').valueAsDate = today;
});