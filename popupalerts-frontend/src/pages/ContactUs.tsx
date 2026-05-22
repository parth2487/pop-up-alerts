import React, { useState,useEffect } from "react";
import { Link } from "react-router-dom";

const ContactUs: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    requirementType: "",
    requirement: "",
  });
  const [publicWorkspaces, setPublicWorkspaces] = useState<{ domain: string }[]>([]);



    useEffect(() => {
    const fetchPublicWorkspaces = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/workspaces/public/domains`);
        const data = await response.json();
        setPublicWorkspaces(data);
        console.log("Public Workspaces:", data);
      } catch (error) {
        console.error("Error fetching public workspaces:", error);
      }
    };

    fetchPublicWorkspaces();
  }, []); 
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error on change
  };

  // Frontend validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    else if (!/^[A-Za-z\s]+$/.test(form.name.trim()))
      newErrors.name = "Name can contain only letters and spaces";
    else if (form.name.trim().length < 3)
      newErrors.name = "Name must be at least 3 characters";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email))
      newErrors.email = "Invalid email address";

    if (!form.contact.trim()) newErrors.contact = "Contact number is required";
    else if (!/^\d{10}$/.test(form.contact))
      newErrors.contact = "Contact must be 10 digits";

    if (!form.requirementType)
      newErrors.requirementType = "Requirement type is required";

    if (!form.requirement.trim())
      newErrors.requirement = "Requirement details are required";
    else if (form.requirement.trim().length < 10)
      newErrors.requirement = "Requirement must be at least 10 characters";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return; // Stop submission if validation fails

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/contact-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          contactNumber: form.contact,
          requirementType: form.requirementType,
          message: form.requirement,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setSuccessMessage(data.message || "Form submitted successfully!");
      setForm({
        name: "",
        email: "",
        contact: "",
        requirementType: "",
        requirement: "",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setErrorMessage(error.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <nav className="sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/Logo.svg" alt="Popupalerts" className="h-12 w-12" />
              <span className="text-xl font-semibold text-gray-900">
                Popupalerts
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-400 rounded-lg hover:from-orange-600 hover:to-amber-500 transition-all shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* FORM */}
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-gray-600 mb-8">
            We would love to hear from you. Fill out the form below:
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-8 shadow-lg rounded-xl border border-gray-100"
          >
            {successMessage && (
              <p className="text-green-600">{successMessage}</p>
            )}
            {errorMessage && <p className="text-red-600">{errorMessage}</p>}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                className="w-full border rounded-lg px-4 py-2"
                value={form.name}
                onChange={handleChange}
                required
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                className="w-full border rounded-lg px-4 py-2"
                value={form.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Contact No
              </label>
              <input
                type="text"
                name="contact"
                className="w-full border rounded-lg px-4 py-2"
                value={form.contact}
                onChange={handleChange}
                required
              />
              {errors.contact && (
                <p className="text-red-600 text-sm mt-1">{errors.contact}</p>
              )}
            </div>

            {/* Requirement Type */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Requirement Type
              </label>
                  <select
                  name="requirementType"
                  className="w-full border rounded-lg px-4 py-2"
                  value={form.requirementType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Requirement</option>
                  {/* Render the dynamic options */}
                  {publicWorkspaces.map((workspace, index) => (
                    <option key={index} value={workspace.domain}>
                      {workspace.domain}
                    </option>
                  ))}
                  
                </select>
              {errors.requirementType && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.requirementType}
                </p>
              )}
            </div>

            {/* Requirement */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Your Requirement
              </label>
              <textarea
                name="requirement"
                rows={4}
                className="w-full border rounded-lg px-4 py-2"
                value={form.requirement}
                onChange={handleChange}
                required
              />
              {errors.requirement && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.requirement}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-all shadow-md"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2025 Popupalerts. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;
