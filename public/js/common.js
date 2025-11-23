// public/js/common.js

const API_BASE = "http://localhost:3000/api";

// -------------------------------------------------------
// Helper: return auth headers with JWT
// -------------------------------------------------------
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: "Bearer " + token } : {};
};

// -------------------------------------------------------
// AUTH: Fetch user profile
// -------------------------------------------------------
export const fetchProfile = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Profile error:", error);
    throw error;
  }
};

// -------------------------------------------------------
// SALARY: Get Salaries (with optional filters)
// -------------------------------------------------------
export const fetchSalaries = async (filters = {}) => {
  try {
    let url = `${API_BASE}/salaries`;

    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const e = await response.json().catch(() => ({ error: "Failed to load" }));
      throw new Error(e.error);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching salaries:", error);
    throw error;
  }
};

// -------------------------------------------------------
// SALARY: Create Salary
// -------------------------------------------------------
export const createSalary = async (data) => {
  try {
    const response = await fetch(`${API_BASE}/salaries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const e = await response.json().catch(() => ({ error: "Failed to create" }));
      throw new Error(e.error);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating salary:", error);
    throw error;
  }
};

// -------------------------------------------------------
// SALARY: Update
// -------------------------------------------------------
export const updateSalaryAPI = async (id, data) => {
  try {
    const response = await fetch(`${API_BASE}/salaries/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const e = await response.json().catch(() => ({ error: "Failed" }));
      throw new Error(e.error);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating salary:", error);
    throw error;
  }
};

// -------------------------------------------------------
// SALARY: Delete
// -------------------------------------------------------
export const deleteSalaryAPI = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/salaries/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      const e = await response.json().catch(() => ({ error: "Failed delete" }));
      throw new Error(e.error);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting salary:", error);
    throw error;
  }
};
