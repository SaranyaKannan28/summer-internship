document.getElementById("logoutBtn").addEventListener("click", () => {
    // Clear session if you stored anything
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to login page
    window.location.href = "index.html";
});
