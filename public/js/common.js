// API Configuration
const API_URL = 'http://localhost:3000/api/salaries';

// Utility Functions
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

// Alert Functions
const showAlert = (type, message) => {
    const alertId = type === 'success' ? 'successAlert' : 'errorAlert';
    const alert = document.getElementById(alertId);
    
    if (alert) {
        alert.textContent = message;
        alert.classList.add('show');

        setTimeout(() => {
            alert.classList.remove('show');
        }, 5000);
    }
};

// API Functions
const fetchSalaries = async (startDate = '', endDate = '') => {
    try {
        let url = API_URL;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch salaries');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching salaries:', error);
        throw error;
    }
};

const fetchSalaryById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch salary');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching salary:', error);
        throw error;
    }
};

const createSalary = async (data) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create salary');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating salary:', error);
        throw error;
    }
};

const updateSalaryAPI = async (id, data) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update salary');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating salary:', error);
        throw error;
    }
};

const deleteSalaryAPI = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete salary');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting salary:', error);
        throw error;
    }
};

// Loading State
const showLoading = (elementId, show = true) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
};

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
});

// Data Analysis Functions
const calculateStats = (salaries) => {
    if (!salaries || salaries.length === 0) {
        return {
            total: 0,
            count: 0,
            average: 0,
            highest: 0,
            lowest: 0,
            uniqueEmployees: 0
        };
    }

    const total = salaries.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const amounts = salaries.map(s => parseFloat(s.amount));
    const uniqueEmployees = new Set(salaries.map(s => s.paidTo)).size;

    return {
        total,
        count: salaries.length,
        average: total / salaries.length,
        highest: Math.max(...amounts),
        lowest: Math.min(...amounts),
        uniqueEmployees
    };
};

const groupByEmployee = (salaries) => {
    const grouped = {};
    
    salaries.forEach(salary => {
        if (!grouped[salary.paidTo]) {
            grouped[salary.paidTo] = {
                name: salary.paidTo,
                totalAmount: 0,
                count: 0,
                payments: []
            };
        }
        
        grouped[salary.paidTo].totalAmount += parseFloat(salary.amount);
        grouped[salary.paidTo].count++;
        grouped[salary.paidTo].payments.push(salary);
    });

    return Object.values(grouped).sort((a, b) => b.totalAmount - a.totalAmount);
};

const groupByType = (salaries) => {
    const grouped = {};
    
    salaries.forEach(salary => {
        if (!grouped[salary.type]) {
            grouped[salary.type] = {
                type: salary.type,
                count: 0,
                totalAmount: 0
            };
        }
        
        grouped[salary.type].count++;
        grouped[salary.type].totalAmount += parseFloat(salary.amount);
    });

    return grouped;
};

const groupByMethod = (salaries) => {
    const grouped = {};
    
    salaries.forEach(salary => {
        if (!grouped[salary.paidThrough]) {
            grouped[salary.paidThrough] = {
                method: salary.paidThrough,
                count: 0,
                totalAmount: 0
            };
        }
        
        grouped[salary.paidThrough].count++;
        grouped[salary.paidThrough].totalAmount += parseFloat(salary.amount);
    });

    return grouped;
};

const getMonthlyData = (salaries) => {
    const monthly = {};
    
    salaries.forEach(salary => {
        const date = new Date(salary.paidOn);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthly[monthKey]) {
            monthly[monthKey] = {
                month: monthKey,
                count: 0,
                totalAmount: 0
            };
        }
        
        monthly[monthKey].count++;
        monthly[monthKey].totalAmount += parseFloat(salary.amount);
    });

    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_URL,
        formatDate,
        formatCurrency,
        showAlert,
        fetchSalaries,
        fetchSalaryById,
        createSalary,
        updateSalaryAPI,
        deleteSalaryAPI,
        showLoading,
        calculateStats,
        groupByEmployee,
        groupByType,
        groupByMethod,
        getMonthlyData
    };
}