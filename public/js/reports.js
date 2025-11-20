// Global variable to store report data
let reportData = [];

// Generate report
const generateReport = async () => {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const reportType = document.getElementById('reportType').value;

    if (!startDate || !endDate) {
        showAlert('error', 'Please select both start and end dates');
        return;
    }

    try {
        reportData = await fetchSalaries(startDate, endDate);

        if (!reportData || reportData.length === 0) {
            showAlert('error', 'No data found for the selected period');
            return;
        }

        // Show summary and tables
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('reportSummary').style.display = 'grid';
        document.getElementById('reportTables').style.display = 'block';

        // Update summary cards
        updateReportSummary(reportData);

        // Display appropriate table based on report type
        displayReportTables(reportType, reportData);

    } catch (error) {
        showAlert('error', 'Failed to generate report: ' + error.message);
    }
};

// Update report summary cards
const updateReportSummary = (salaries) => {
    const stats = calculateStats(salaries);

    document.getElementById('reportTotalAmount').textContent = formatCurrency(stats.total);
    document.getElementById('reportTotalRecords').textContent = stats.count;
    document.getElementById('reportTotalEmployees').textContent = stats.uniqueEmployees;
    document.getElementById('reportAverage').textContent = formatCurrency(stats.average);
};

// Display report tables based on type
const displayReportTables = (type, salaries) => {
    // Hide all tables first
    document.getElementById('allPaymentsTable').style.display = 'none';
    document.getElementById('employeeSummaryTable').style.display = 'none';
    document.getElementById('methodSummaryTable').style.display = 'none';

    switch (type) {
        case 'all':
            displayAllPayments(salaries);
            break;
        case 'monthly':
            displayMonthlyReport(salaries);
            break;
        case 'employee':
            displayEmployeeReport(salaries);
            break;
        case 'method':
            displayMethodReport(salaries);
            break;
    }
};

// Display all payments
const displayAllPayments = (salaries) => {
    const tbody = document.getElementById('allPaymentsBody');
    document.getElementById('allPaymentsTable').style.display = 'block';

    tbody.innerHTML = salaries.map(s => `
        <tr>
            <td>${formatDate(s.paidOn)}</td>
            <td>${s.paidTo}</td>
            <td>${s.type}</td>
            <td>${formatCurrency(s.amount)}</td>
            <td>${s.paidThrough}</td>
            <td>${formatDate(s.startDate)} - ${formatDate(s.endDate)}</td>
        </tr>
    `).join('');
};

// Display monthly report
const displayMonthlyReport = (salaries) => {
    const monthly = getMonthlyData(salaries);
    const tbody = document.getElementById('allPaymentsBody');
    document.getElementById('allPaymentsTable').style.display = 'block';

    // Change table headers for monthly view
    const table = document.querySelector('#allPaymentsTable table');
    table.querySelector('thead tr').innerHTML = `
        <th>Month</th>
        <th>Number of Payments</th>
        <th>Total Amount</th>
        <th>Average Amount</th>
    `;

    tbody.innerHTML = monthly.map(m => `
        <tr>
            <td>${m.month}</td>
            <td>${m.count}</td>
            <td>${formatCurrency(m.totalAmount)}</td>
            <td>${formatCurrency(m.totalAmount / m.count)}</td>
        </tr>
    `).join('');
};

// Display employee report
const displayEmployeeReport = (salaries) => {
    const employeeData = groupByEmployee(salaries);
    const tbody = document.getElementById('employeeSummaryBody');
    document.getElementById('employeeSummaryTable').style.display = 'block';

    tbody.innerHTML = employeeData.map(emp => `
        <tr>
            <td>${emp.name}</td>
            <td>${emp.count}</td>
            <td>${formatCurrency(emp.totalAmount)}</td>
            <td>${formatCurrency(emp.totalAmount / emp.count)}</td>
        </tr>
    `).join('');
};

// Display payment method report
const displayMethodReport = (salaries) => {
    const methodData = groupByMethod(salaries);
    const total = salaries.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const tbody = document.getElementById('methodSummaryBody');
    document.getElementById('methodSummaryTable').style.display = 'block';

    tbody.innerHTML = Object.values(methodData).map(method => `
        <tr>
            <td>${method.method}</td>
            <td>${method.count}</td>
            <td>${formatCurrency(method.totalAmount)}</td>
            <td>${((method.totalAmount / total) * 100).toFixed(2)}%</td>
        </tr>
    `).join('');
};

// Export report as PDF with proper formatting
const exportReport = () => {
    if (!reportData || reportData.length === 0) {
        showAlert('error', 'Please generate a report first');
        return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get the report type
    const reportType = document.getElementById('reportType').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    // Calculate statistics
    const stats = calculateStats(reportData);
    
    // Generate HTML content
    let reportContent = generatePrintableReport(reportType, reportData, stats, startDate, endDate);
    
    printWindow.document.write(reportContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
    };
};

// Generate printable report HTML
const generatePrintableReport = (type, data, stats, startDate, endDate) => {
    const currentDate = new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    let tableContent = '';
    let reportTitle = '';

    switch (type) {
        case 'all':
            reportTitle = 'All Payments Report';
            tableContent = generateAllPaymentsTable(data);
            break;
        case 'monthly':
            reportTitle = 'Monthly Summary Report';
            tableContent = generateMonthlyTable(data);
            break;
        case 'employee':
            reportTitle = 'Employee-wise Report';
            tableContent = generateEmployeeTable(data);
            break;
        case 'method':
            reportTitle = 'Payment Method Report';
            tableContent = generateMethodTable(data);
            break;
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${reportTitle}</title>
            <style>
                @media print {
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #333;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #667eea;
                    padding-bottom: 20px;
                }
                
                .header h1 {
                    color: #667eea;
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                
                .header h2 {
                    color: #666;
                    font-size: 18px;
                    font-weight: normal;
                    margin-bottom: 5px;
                }
                
                .header p {
                    color: #999;
                    font-size: 14px;
                }
                
                .report-info {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border-left: 4px solid #667eea;
                }
                
                .report-info p {
                    margin: 5px 0;
                    font-size: 14px;
                }
                
                .report-info strong {
                    color: #667eea;
                }
                
                .statistics {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 30px;
                }
                
                .stat-box {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                }
                
                .stat-box h3 {
                    font-size: 24px;
                    margin-bottom: 5px;
                }
                
                .stat-box p {
                    font-size: 12px;
                    opacity: 0.9;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                
                thead {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                
                th {
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 13px;
                }
                
                td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #e0e0e0;
                    font-size: 12px;
                }
                
                tbody tr:nth-child(even) {
                    background: #f8f9fa;
                }
                
                tbody tr:hover {
                    background: #e9ecef;
                }
                
                .total-row {
                    font-weight: bold;
                    background: #e9ecef !important;
                    border-top: 2px solid #667eea;
                }
                
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #e0e0e0;
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                }
                
                .no-print {
                    display: none;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>💰 Salary Management System</h1>
                <h2>${reportTitle}</h2>
                <p>Generated on ${currentDate}</p>
            </div>
            
            <div class="report-info">
                <p><strong>Report Period:</strong> ${formatDate(startDate)} to ${formatDate(endDate)}</p>
                <p><strong>Generated By:</strong> System Administrator</p>
            </div>
            
            <div class="statistics">
                <div class="stat-box">
                    <h3>${formatCurrency(stats.total)}</h3>
                    <p>Total Amount</p>
                </div>
                <div class="stat-box">
                    <h3>${stats.count}</h3>
                    <p>Total Records</p>
                </div>
                <div class="stat-box">
                    <h3>${stats.uniqueEmployees}</h3>
                    <p>Employees</p>
                </div>
                <div class="stat-box">
                    <h3>${formatCurrency(stats.average)}</h3>
                    <p>Average Payment</p>
                </div>
            </div>
            
            ${tableContent}
            
            <div class="footer">
                <p>This is a computer-generated document. No signature is required.</p>
                <p>&copy; ${new Date().getFullYear()} Salary Management System. All rights reserved.</p>
            </div>
        </body>
        </html>
    `;
};

// Generate all payments table
const generateAllPaymentsTable = (data) => {
    const total = data.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    
    return `
        <h3 style="margin-bottom: 15px; color: #667eea;">Payment Details</h3>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Period</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(s => `
                    <tr>
                        <td>${formatDate(s.paidOn)}</td>
                        <td>${s.paidTo}</td>
                        <td>${s.type}</td>
                        <td>${formatCurrency(s.amount)}</td>
                        <td>${s.paidThrough}</td>
                        <td>${formatDate(s.startDate)} - ${formatDate(s.endDate)}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td colspan="3">TOTAL</td>
                    <td>${formatCurrency(total)}</td>
                    <td colspan="2">${data.length} Payments</td>
                </tr>
            </tbody>
        </table>
    `;
};

// Generate monthly table
const generateMonthlyTable = (data) => {
    const monthly = getMonthlyData(data);
    const total = monthly.reduce((sum, m) => sum + m.totalAmount, 0);
    
    return `
        <h3 style="margin-bottom: 15px; color: #667eea;">Monthly Summary</h3>
        <table>
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Number of Payments</th>
                    <th>Total Amount</th>
                    <th>Average Amount</th>
                </tr>
            </thead>
            <tbody>
                ${monthly.map(m => `
                    <tr>
                        <td>${m.month}</td>
                        <td>${m.count}</td>
                        <td>${formatCurrency(m.totalAmount)}</td>
                        <td>${formatCurrency(m.totalAmount / m.count)}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td>TOTAL</td>
                    <td>${monthly.reduce((sum, m) => sum + m.count, 0)}</td>
                    <td>${formatCurrency(total)}</td>
                    <td>${formatCurrency(total / monthly.length)}</td>
                </tr>
            </tbody>
        </table>
    `;
};

// Generate employee table
const generateEmployeeTable = (data) => {
    const employeeData = groupByEmployee(data);
    const total = employeeData.reduce((sum, e) => sum + e.totalAmount, 0);
    
    return `
        <h3 style="margin-bottom: 15px; color: #667eea;">Employee-wise Summary</h3>
        <table>
            <thead>
                <tr>
                    <th>Employee Name</th>
                    <th>Total Payments</th>
                    <th>Total Amount</th>
                    <th>Average Amount</th>
                </tr>
            </thead>
            <tbody>
                ${employeeData.map(emp => `
                    <tr>
                        <td>${emp.name}</td>
                        <td>${emp.count}</td>
                        <td>${formatCurrency(emp.totalAmount)}</td>
                        <td>${formatCurrency(emp.totalAmount / emp.count)}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td>TOTAL</td>
                    <td>${employeeData.reduce((sum, e) => sum + e.count, 0)}</td>
                    <td>${formatCurrency(total)}</td>
                    <td>${formatCurrency(total / employeeData.length)}</td>
                </tr>
            </tbody>
        </table>
    `;
};

// Generate method table
const generateMethodTable = (data) => {
    const methodData = Object.values(groupByMethod(data));
    const total = methodData.reduce((sum, m) => sum + m.totalAmount, 0);
    
    return `
        <h3 style="margin-bottom: 15px; color: #667eea;">Payment Method Summary</h3>
        <table>
            <thead>
                <tr>
                    <th>Payment Method</th>
                    <th>Number of Payments</th>
                    <th>Total Amount</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${methodData.map(method => `
                    <tr>
                        <td>${method.method}</td>
                        <td>${method.count}</td>
                        <td>${formatCurrency(method.totalAmount)}</td>
                        <td>${((method.totalAmount / total) * 100).toFixed(2)}%</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td>TOTAL</td>
                    <td>${methodData.reduce((sum, m) => sum + m.count, 0)}</td>
                    <td>${formatCurrency(total)}</td>
                    <td>100.00%</td>
                </tr>
            </tbody>
        </table>
    `;
};

// Set default dates (current month)
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    document.getElementById('reportStartDate').valueAsDate = firstDay;
    document.getElementById('reportEndDate').valueAsDate = lastDay;
});