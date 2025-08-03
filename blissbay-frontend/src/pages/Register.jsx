import { useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Resizer from "react-image-file-resizer";

// statesList
const statesList = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT",
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    role: "customer", // Added to match backend default
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [formStep, setFormStep] = useState(1); // Track form steps for better UX

  // Form validation - update to match backend validation expectations
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Validate phone (optional, but if provided must be valid)
    if (formData.phone && !/^\+?\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 to 15 digits";
    }

    // Validate address fields
    if (!formData.street.trim()) {
      newErrors.street = "Street is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state) {
      newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear previous errors
    setErrors((prev) => ({ ...prev, avatar: "" }));

    // Validate file size (max 2MB to match backend validation)
    if (file.size > 3 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Image size should be less than 3MB",
      }));
      return;
    }

    // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    setErrors((prev) => ({
      ...prev,
      avatar: "Please upload a JPEG, PNG, or WebP image"
    }));
    return;
  }
    // Start loading
    setImageLoading(true);

    // Resize and compress the image to match backend requirements
    Resizer.imageFileResizer(
      file,
      300, // max width
      300, // max height
      "JPEG", // format
      80, // quality
      0, // rotation
      (resizedFile) => {
        setAvatarFile(resizedFile);
      setAvatarPreview(URL.createObjectURL(resizedFile));
      setImageLoading(false);
      },
      "blob",
      // Error handling
      (err) => {
        console.error("Error resizing image:", err);
        setErrors((prev) => ({
          ...prev,
          avatar: "Failed to process image. Please try another.",
        }));
        setImageLoading(false);
      }
    );
  };

  const promptRemoveAvatar = () => {
    setShowRemoveConfirmation(true);
  };

  const confirmRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setShowRemoveConfirmation(false);
  };

  const cancelRemoveAvatar = () => {
    setShowRemoveConfirmation(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    const isValid = validateForm();
    if (!isValid) return;

    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      // Create FormData object for submission
      const submitData = new FormData();

      // Add all form fields except confirmPassword
      Object.keys(formData).forEach((key) => {
        if (key !== "confirmPassword") {
          // Convert email to lowercase to match backend processing
          if (key === "email") {
            submitData.append(key, formData[key].toLowerCase().trim());
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      // Add avatar file if present - matches backend expected field name
      if (avatarFile) {
        submitData.append("avatar", avatarFile);
      }

      // Ensure all required fields are present based on backend requirements
      const requiredFields = [
        "name",
        "email",
        "password",
        "street",
        "city",
        "state",
      ];
      let missingFields = [];

      requiredFields.forEach((field) => {
        if (!submitData.has(field) || !submitData.get(field)) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        setErrors({
          form: `Missing required fields: ${missingFields.join(", ")}`,
        });
        setLoading(false);
        return;
      }

      // Send the registration request to match backend API
      const response = await axiosInstance.post("/api/users/register", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Check for success response based on backend format
      if (response.data.success) {
        setSuccess(response.data.message || "Registration successful! Redirecting to login...");
        
        // Redirect after a brief delay to show success message
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // This shouldn't happen with your current API but handling just in case
        setErrors({ form: "Registration failed. Please try again." });
      }
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);

      // Handle backend validation errors based on backend error response format
      if (err.response?.data?.error) {
        setErrors({ form: err.response.data.error });
      } else if (err.response?.status === 409) {
        setErrors({ form: "Email already in use" });
      } else if (err.response?.status === 400) {
        setErrors({ form: err.response.data.error || "Invalid input data. Please check your form." });
      } else {
        setErrors({ form: "Registration failed. Please try again later." });
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading indicator for avatar upload
  const avatarLoadingIndicator = imageLoading && (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Account
        </h2>

        {/* Success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">
            {success}
          </div>
        )}

        {/* General form error */}
        {errors.form && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            {errors.form}
          </div>
        )}

        {/* Image upload section with improved UX */}
        <div className="flex flex-col items-center mb-6">
          {avatarPreview ? (
            <>
              <div className="relative">
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-full object-cover mb-2 transition-opacity duration-300"
                  onLoad={() => setImageLoading(false)}
                />
                {avatarLoadingIndicator}
              </div>
              <button
                type="button"
                onClick={promptRemoveAvatar}
                className="text-red-500 hover:text-red-600 underline text-sm mt-2"
              >
                Remove Image
              </button>
            </>
          ) : (
            <>
              <div className="relative w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2 overflow-hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {avatarLoadingIndicator}
              </div>
              <label
                htmlFor="avatar"
                className={`cursor-pointer px-3 py-1 ${
                  imageLoading
                    ? "bg-gray-100 text-gray-400"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                } rounded-md transition`}
              >
                {imageLoading ? "Processing..." : "Upload Image"}
              </label>
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={imageLoading}
              />
            </>
          )}
          {errors.avatar && (
            <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
          )}
        </div>

        {/* Remove confirmation dialog */}
        {showRemoveConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-3">Remove Image?</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to remove this image? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelRemoveAvatar}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveAvatar}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          {/* Form progress indicator */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <div
                className={`h-2 w-8 rounded ${
                  formStep >= 1 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`h-2 w-8 rounded ${
                  formStep >= 2 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
            </div>
            <span className="text-sm text-gray-500">Step {formStep} of 2</span>
          </div>

          {formStep === 1 ? (
            <>
              {/* Step 1: Account Information */}
              <div className="space-y-4">
                {/* Name field */}
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email field */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password field */}
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <FiEyeOff size={20} />
                      ) : (
                        <FiEye size={20} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password field */}
                <div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff size={20} />
                      ) : (
                        <FiEye size={20} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    // Validate first step fields
                    const newErrors = {};

                    if (!formData.name.trim()) {
                      newErrors.name = "Name is required";
                    } else if (formData.name.trim().length < 2) {
                      newErrors.name = "Name must be at least 2 characters";
                    }

                    const emailRegex =
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
                    if (!formData.email.trim()) {
                      newErrors.email = "Email is required";
                    } else if (!emailRegex.test(formData.email)) {
                      newErrors.email = "Invalid email format";
                    }

                    const passwordRegex =
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
                    if (!formData.password) {
                      newErrors.password = "Password is required";
                    } else if (!passwordRegex.test(formData.password)) {
                      newErrors.password =
                        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
                    }

                    if (formData.password !== formData.confirmPassword) {
                      newErrors.confirmPassword = "Passwords do not match";
                    }

                    if (Object.keys(newErrors).length === 0) {
                      setFormStep(2);
                      setErrors({});
                    } else {
                      setErrors(newErrors);
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-6"
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Contact Information */}
              <div className="space-y-4">
                {/* Phone field */}
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number (optional)"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Street Address field */}
                <div>
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    value={formData.street}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.street ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
                  />
                  {errors.street && (
                    <p className="text-red-500 text-xs mt-1">{errors.street}</p>
                  )}
                </div>

                {/* City and State fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.state ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition appearance-none bg-white`}
                    >
                      <option value="">Select State</option>
                      {statesList.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notice about default country - matches backend implementation */}
                <div className="text-gray-500 text-sm">
                  <p>* Country will be set to Nigeria by default</p>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {loading ? "Processing..." : "Register"}
                  </button>
                </div>
              </div>
            </>
          )}
        </form>

        {/* Sign in link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;