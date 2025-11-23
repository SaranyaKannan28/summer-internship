async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value.trim();

  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role })
  });

  const data = await res.json();

  if (!res.ok) return alert(data.error);

  localStorage.setItem("token", data.token);

  // redirect based on role
  if (role === "admin") {
    window.location.href = "dashboard.html";   // Admin dashboard
  } else {
    window.location.href = "employee-dashboard.html"; // Employee dashboard
  }
}
