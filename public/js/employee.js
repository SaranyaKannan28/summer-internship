const API_BASE = "http://localhost:3000"; 
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

let currentUserEmail = null;
let currentUserName = null;

async function fetchProfile() {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });

  if (!res.ok) throw new Error('Failed to fetch profile');
  const data = await res.json();
  return data.user;
}

async function fetchSalaries(email, fromDate, toDate) {
  const params = new URLSearchParams();
  params.set('paidTo', email);
  if (fromDate) params.set('startDate', fromDate);
  if (toDate) params.set('endDate', toDate);

  const res = await fetch(`${API_BASE}/api/salaries?` + params.toString(), {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed' }));
    throw new Error(err.error || 'Failed to fetch salaries');
  }
  return res.json();
}

function formatDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString();
}

function formatCurrency(v) {
  if (v === null || v === undefined) return '-';
  return '₹' + Number(v).toFixed(2);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function renderSalaries(salaries) {
  const tbody = document.getElementById('employeeSalaryBody');
  tbody.innerHTML = '';
  const noRecords = document.getElementById('noRecords');
  if (!salaries || salaries.length === 0) {
    noRecords.style.display = 'block';
    return;
  }
  noRecords.style.display = 'none';

  salaries.forEach(s => {
    let breakdown = '-';
    try {
      if (s.remarks) {
        const r = typeof s.remarks === 'string' ? JSON.parse(s.remarks) : s.remarks;
        if (r.breakdown) {
          breakdown = `<div style="max-width:300px;"><strong>Net:</strong> ${formatCurrency(r.net)}<br/>
            <small>Earnings: ${formatCurrency(r.totalEarnings)} | Deductions: ${formatCurrency(r.totalDeductions)}</small>
            <details><summary>Components</summary><ul style="padding-left:12px;">${Object.values(r.components).map(c=>`<li>${c.name}: ${formatCurrency(c.value)} (${c.type})</li>`).join('')}</ul></details></div>`;
        } else {
          breakdown = escapeHtml(String(s.remarks)).slice(0,300);
        }
      }
    } catch(e) {
      breakdown = escapeHtml(String(s.remarks || '-'));
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${s.type}</td>
      <td>${formatCurrency(s.amount)}</td>
      <td>${formatDate(s.paidOn)}</td>
      <td>${s.paidThrough}</td>
      <td>${formatDate(s.startDate)} - ${formatDate(s.endDate)}</td>
      <td>${breakdown}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function initDashboard() {
  const loading = document.getElementById('loading');
  loading.style.display = 'block';
  try {
    const user = await fetchProfile();
    currentUserEmail = user.email;
    currentUserName = user.name;
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;

    const salaries = await fetchSalaries(currentUserEmail);
    renderSalaries(salaries);
  } catch (err) {
    console.error(err);
    alert('Failed to load dashboard. Please login again.');
    localStorage.clear();
    window.location.href = 'index.html';
  } finally {
    loading.style.display = 'none';
  }
}

// Filter handlers
async function applyDateFilter() {
  const from = document.getElementById('fromDate').value || null;
  const to = document.getElementById('toDate').value || null;
  document.getElementById('loading').style.display = 'block';
  try {
    const salaries = await fetchSalaries(currentUserEmail, from, to);
    renderSalaries(salaries);
  } catch (err) {
    alert('Failed to apply filter');
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

function clearDateFilter() {
  document.getElementById('fromDate').value = '';
  document.getElementById('toDate').value = '';
  initDashboard();
}

// Logout
function logout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  document.getElementById('applyFilterBtn').addEventListener('click', applyDateFilter);
  document.getElementById('clearFilterBtn').addEventListener('click', clearDateFilter);
  document.getElementById('logoutBtn').addEventListener('click', logout);
});
