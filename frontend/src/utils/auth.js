// frontend/src/utils/auth.js

export const getRoleBasedRoute = (role) => {
  const routes = {
    "kepala unit": "/dashboard/kepala-unit",
    "mitra bestari": "/dashboard/mitra-bestari",
    "perawat": "/dashboard/perawat",
  };
  return routes[role?.toLowerCase()] || "/dashboard/perawat";
};

export const loginUser = async (npk, password) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ npk, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, message: errorData.message };
    }

    const data = await res.json();
    return { success: true, ...data };
  } catch (err) {
    return { success: false, message: "Server error" };
  }
};

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    // Bersihkan localStorage di sisi client
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
