import {
  Routes,
  Route,
  Link,
  useNavigate,
  Outlet,
  Navigate,
  NavLink,
  useSearchParams,
} from "react-router-dom";
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useRef,
} from "react";
import apiClient from "./api/axios";
import { Toaster, toast } from "react-hot-toast"; // <-- 1. Impor Toaster

// Halaman-halaman yang diimpor dari file lain
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import WidgetListPage from "./pages/WidgetListPage";
import ReviewManagementPage from "./pages/ReviewManagementPage";
import PricingPage from "./pages/PricingPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelledPage from "./pages/PaymentCancelledPage";
import LandingPage from "./pages/LandingPage";
import BillingPage from "./pages/BillingPage";
import ContactPage from "./pages/ContactUs";

// --- INTERFACE & KONTEKS OTENTIKASI ---
interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const verifyUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const response = await apiClient.get("/auth/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Token invalid, logging out.", error);
        localStorage.removeItem("access_token");
        delete apiClient.defaults.headers.common["Authorization"];
        setUser(null);
      }
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  const login = (token: string, userData: User) => {
    localStorage.setItem("access_token", token);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    if (userData.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/app/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    delete apiClient.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// --- KOMPONEN TATA LETAK UTAMA (UNTUK PENGGUNA) DENGAN TEMA GELAP ---
const MainLayout = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const SidebarIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="w-5 h-5">{children}</div>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        {/* --- PERBAIKAN LOGO & HEADER SIDEBAR --- */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
          {/* PASTIKAN nama file sama persis (case-sensitive) -> /public/Logo.svg */}
          <img src="/Logo.svg" alt="Popupalerts Logo" className="h-8 w-auto" />
          <span className="ml-3 text-xl font-bold text-gray-800">
            Popupalerts
          </span>
        </div>
        {/* ----------------------------------------- */}
        <nav className="mt-6 px-4 space-y-2">
          <NavLink
            to="/app/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md gap-3 transition-colors ${
                isActive
                  ? "bg-orange-50 text-brand-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <SidebarIcon>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </SidebarIcon>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/app/pricing"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md gap-3 transition-colors ${
                isActive
                  ? "bg-orange-50 text-brand-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <SidebarIcon>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </SidebarIcon>
            <span>Pricing</span>
          </NavLink>
          <NavLink
            to="/app/account"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md gap-3 transition-colors ${
                isActive
                  ? "bg-orange-50 text-brand-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <SidebarIcon>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </SidebarIcon>
            <span>Account</span>
          </NavLink>
          {user && user.role === "admin" && (
            <NavLink
              to="/admin/dashboard"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md gap-3 text-yellow-600 hover:bg-yellow-50"
            >
              <SidebarIcon>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 16v-2m4-14h2m-16 0h2M12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM22 12h-2M4 12H2"
                  />
                </svg>
              </SidebarIcon>
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* --- PERBAIKAN HEADER --- */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex justify-end items-center p-4 h-16">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <span>{user?.name}</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* ------------------------- */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// --- KOMPONEN HALAMAN LAINNYA ---

const AccountPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleManageSubscription = async () => {
    if (!user?.id) {
      setError("User not found");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await apiClient.post("/billing/create-portal-session");
      //         const response = await apiClient.post('/billing/paypal/details', {
      //   userId: user.id, // pass userId explicitly
      // });

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not open billing portal.");
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Profile Information</h2>
          <p className="text-gray-600">
            <strong>Name:</strong> {user?.name}
          </p>
          <p className="text-gray-600">
            <strong>Email:</strong> {user?.email}
          </p>
        </div>
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold">Billing</h2>
          <p className="text-gray-600 mb-4">
            Manage your subscription, view invoices, and update your payment
            method.
          </p>
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? "Redirecting..." : "Manage Billing & Subscription"}
          </button>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

const CheckEmailPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gray-50">
    <h1 className="text-4xl font-bold text-gray-800 mb-4">Check Your Email</h1>
    <p className="text-lg text-gray-600 mb-8">
      We've sent a verification link to your email address. Please click the
      link to activate your account.
    </p>
    <Link
      to="/login"
      className="px-6 py-3 font-medium text-white bg-brand-primary rounded-md "
    >
      Back to Login
    </Link>
  </div>
);

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying your email...");
  const [error, setError] = useState("");
  const hasRun = useRef(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setError("Verification token is missing.");
      return;
    }
    let executed = false;

    const verifyToken = async () => {
      setError("");
      setStatus("Verifying your email...");
      try {
        const response = await apiClient.post("/auth/verify-email", { token });
        setStatus(response.data.message);
        setTimeout(() => navigate("/login"), 3000);
      } catch (err: any) {
        console.log("ERR STATUS:", err.response?.status);
        console.log("ERR DATA:", err.response?.data);
        setError(
          err.response?.data?.message ||
            "Verification failed. The token might be invalid or expired."
        );
      }
    };
    if (!executed) {
      verifyToken();
    }
  }, [searchParams, navigate]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gray-50">
      {error ? (
        <>
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            Verification Failed
          </h1>
          <p className="text-lg text-gray-700 mb-8">{error}</p>
          <Link to="/register" className="text-indigo-600">
            Try signing up again
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            Verification in Progress
          </h1>
          <p className="text-lg text-gray-700">{status}</p>
          <p className="mt-4">
            You will be redirected to the login page shortly...
          </p>
        </>
      )}
    </div>
  );
};

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred.");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm text-gray-600">
            Enter your email address and we will send you a link to reset your
            password.
          </p>
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md"
            />
          </div>
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-brand-primary rounded-md   font-medium text-brand-primary "
          >
            Send Reset Link
          </button>
        </form>
        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-brand-primary ">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    setError("");
    setMessage("");
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        password,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md"
            />
          </div>
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-brand-primary rounded-md"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

// --- KOMPONEN-KOMPONEN ADMIN & PENGGUNA ---
interface Subscription {
  id: string;
  user?: { email?: string };
  status: string;
  stripe_subscription_id: string;
  created_at: string;
}
interface Workspace {
  id: string;
  name: string;
  domain: string;
}
interface WorkspaceStats {
  totalViews: number;
  totalLeads: number;
}

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white flex-shrink-0">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="mt-6">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `block py-2.5 px-4 rounded transition duration-200 ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `block py-2.5 px-4 rounded transition duration-200 ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            Users
          </NavLink>
          <NavLink
            to="/admin/subscriptions"
            className={({ isActive }) =>
              `block py-2.5 px-4 rounded transition duration-200 ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            Subscriptions
          </NavLink>

          <NavLink
            to="/admin/leads"
            className={({ isActive }) =>
              `block py-2.5 px-4 rounded transition duration-200 ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            Leads
          </NavLink>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200">
          <div className="flex justify-between items-center p-4">
            <div className="font-bold">ADMIN VIEW</div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2"
              >
                <span>{user?.name} (Admin)</span>
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  {/* --- PERBAIKAN UTAMA DI SINI --- */}
                  <Link
                    to="/app/dashboard"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Exit Admin View
                  </Link>
                  {/* ------------------------------- */}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    subs: 0,
    widgets: 0,
    leads: 0,
  });
  const [loading, setLoading] = useState(true);

  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, subsRes, widgetsRes, leadsRes] = await Promise.all([
          apiClient.get("/admin/stats/total-users"),
          apiClient.get("/admin/stats/total-subscriptions"),
          apiClient.get("/admin/stats/total-widgets"),
          apiClient.get("/admin/stats/total-leads"),
        ]);

        setStats((prev) => ({
          ...prev,
          users: usersRes.data.count,
          subs: subsRes.data.count,
          widgets: widgetsRes.data.count,
        }));
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    const fetchContacts = async () => {
      try {
        const res = await apiClient.get("/contact-us");
        setStats((prev) => ({
          ...prev,
          leads: res.data.length,
        }));
      } catch (error) {
        console.error("Error fetching contact us details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={loading ? "..." : stats.users}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197"
              />
            </svg>
          }
        />
        <StatCard
          title="Active Subscriptions"
          value={loading ? "..." : stats.subs}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Widgets"
          value={loading ? "..." : stats.widgets}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Leads"
          value={loading ? "..." : stats.leads}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  useEffect(() => {
    apiClient
      .get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch(() => setError("Failed to fetch users."))
      .finally(() => setLoading(false));
  }, []);
  const handleRoleChange = async (
    userId: string,
    newRole: "user" | "admin"
  ) => {
    setUpdatingRoleId(userId);
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert("Failed to update user role.");
    } finally {
      setUpdatingRoleId(null);
    }
  };
  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(
                        user.id,
                        e.target.value as "user" | "admin"
                      )
                    }
                    disabled={updatingRoleId === user.id}
                    className={`px-2 py-1 text-xs font-semibold rounded-full border-none appearance-none ${
                      user.role === "admin"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    } disabled:opacity-50`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  console.log("subscriptions :: ", subscriptions);
  useEffect(() => {
    apiClient
      .get("/admin/subscriptions")
      .then((res) => setSubscriptions(res.data))
      .catch(() => setError("Failed to fetch subscriptions."))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div>Loading subscriptions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  return (
    //comment

    <div>
      <h1 className="text-2xl font-bold mb-4">Subscriptions Management</h1>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Payment Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Subscription ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Plan Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created At
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((sub) => {
              const isStripe = !!sub.stripe_subscription_id;
              const isPaypal = !!sub.paypal_subscription_id;

              return (
                <tr key={sub.id}>
                  {/* USER EMAIL */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sub.user?.email || "N/A"}
                  </td>

                  {/* PAYMENT METHOD */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isStripe ? (
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        Stripe
                      </span>
                    ) : isPaypal ? (
                      <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                        PayPal
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  {/* SUBSCRIPTION ID */}
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                    {isStripe
                      ? sub.stripe_subscription_id
                      : isPaypal
                      ? sub.paypal_subscription_id
                      : "N/A"}
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sub.amount
                      ? `${sub.currency || "USD"} ${sub.amount}`
                      : "N/A"}
                  </td>

                  {/* PLAN TYPE */}
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {sub.plan_type || "N/A"}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sub.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>

                  {/* CREATED AT */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface ContactUs {
  id: number;
  name: string;
  email: string;
  contactNumber: string;
  requirementType: string;
  message: string;
  createdAt: string;
}

const AdminContactUsPage = () => {
  const [contacts, setContacts] = useState<ContactUs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await apiClient.get("/contact-us");
        console.log("Contact Us Data:", res.data);
        setContacts(res.data);
      } catch (error) {
        console.error("Error fetching contact us details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Leads Management</h1>
      <div className="bg-white shadow rounded-lg overflow-x-auto mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          {/* TABLE HEAD */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contact Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Domain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Requiremnts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created At
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td className="px-6 py-4 text-center" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-center text-gray-500" colSpan={6}>
                  No contact requests found.
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{c.name}</td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {c.email || "N/A"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {c.contactNumber || "N/A"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      {c.requirementType}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                    {c.message}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
  const [stats, setStats] = useState<WorkspaceStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1️⃣ Fetch widget open-count total
        const openCountRes = await apiClient.get(
          `/workspaces/${workspace.id}/widgets/open-count/total`
        );
        console.log("Open Count Total Response:", openCountRes.data);

        // 2️⃣ Fetch lead count for this workspace domain
        const leadRes = await apiClient.get(
          `/workspace-lead/count/${workspace.domain}`
        );
        console.log("Lead Count Response:", leadRes.data);

        // 3️⃣ Merge stats for UI
        setStats({
          totalViews: openCountRes.data.total_open_count ?? 0, // 👈 use open_count sum
          totalLeads: leadRes.data.count ?? 0,
        });
      } catch (err) {
        console.error(
          `Failed to fetch stats for workspace ${workspace.id}`,
          err
        );
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [workspace.id, workspace.domain]);

  return (
    <Link
      to={`/app/workspace/${workspace.id}`}
      className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{workspace.name}</h3>
          <p className="text-sm text-gray-500">{workspace.domain}</p>
        </div>
        <span className="text-gray-400">&rarr;</span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-6">
        <div>
          <p className="text-xs text-gray-500 uppercase">Total Opens</p>
          <p className="text-xl font-semibold">
            {loadingStats ? "..." : stats?.totalViews ?? 0}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase">Total Leads</p>
          <p className="text-xl font-semibold">
            {loadingStats ? "..." : stats?.totalLeads ?? 0}
          </p>
        </div>
      </div>
    </Link>
  );
};

const DashboardPage = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // ------------------------------
  // Free plan logic (only 1 workspace allowed)
  // ------------------------------
  const handleOpenModal = () => {
    const maxAllowed = isSubscribed ? 10 : 1;

    if (workspaces.length >= maxAllowed) {
      toast.error(
        isSubscribed
          ? "You have reached your limit of 10 workspaces."
          : "Upgrade your plan to create more workspaces."
      );
      return;
    }

    setIsModalOpen(true);
  };

  // ------------------------------
  // Fetch Workspaces
  // ------------------------------
  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/workspaces");
      console.log("heyy", response.data);
      setIsSubscribed(response.data.isSubscribed); // ✅ Save subscription info
      setWorkspaces(response.data.workspaces);
    } catch (err) {
      setError("Failed to fetch workspaces.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // ------------------------------
  // Create Workspace
  // ------------------------------
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiClient.post("/workspaces", {
        name: newName,
        domain: newDomain,
      });

      // Reset form
      setNewName("");
      setNewDomain("");
      setIsModalOpen(false);
      toast.success("Workspace created successfully!");

      // Refresh workspace list
      fetchWorkspaces();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create workspace.");
    }
  };

  // ------------------------------
  // Loading & Error UI
  // ------------------------------
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <button
          //   onClick={() => setIsModalOpen(true)}
          onClick={handleOpenModal}
          className="px-4 py-2 font-medium text-white bg-brand-primary rounded-md hover:opacity-90"
        >
          + Create Workspace
        </button>
      </div>

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Create New Workspace</h2>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Workspace Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="domain"
                  className="block text-sm font-medium text-gray-700"
                >
                  Domain
                </label>
                <input
                  type="text"
                  id="domain"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  required
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-brand-primary rounded-md hover:opacity-90"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace List */}
      <h2 className="text-xl font-semibold mb-4">Your Workspaces</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.length > 0 ? (
          workspaces.map((ws) => <WorkspaceCard key={ws.id} workspace={ws} />)
        ) : (
          <p className="col-span-full text-gray-500">
            You don't have any workspaces yet. Create one above!
          </p>
        )}
      </div>
    </div>
  );
};

// --- KOMPONEN RUTE PENJAGA ---
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg text-white">
        Loading...
      </div>
    );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
const PublicRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg text-white">
        Loading...
      </div>
    );
  return user ? <Navigate to="/app/dashboard" replace /> : <Outlet />;
};
const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return user && user.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/app/dashboard" replace />
  );
};

// --- KOMPONEN UTAMA & RUTE ---
function AppRoutes() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route element={<PublicRoute />}></Route>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/check-email" element={<CheckEmailPage />} />
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/contactus" element={<ContactPage />} />

        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="workspace/:workspaceId" element={<WidgetListPage />} />
            <Route
              path="widget/:widgetId/reviews"
              element={<ReviewManagementPage />}
            />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="payment/success" element={<PaymentSuccessPage />} />
            <Route
              path="payment/cancelled"
              element={<PaymentCancelledPage />}
            />
          </Route>
        </Route>

        {/* Rute Admin (dilindungi oleh AdminRoute) */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="leads" element={<AdminContactUsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
