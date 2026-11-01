
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const emptyAddress = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const emptyPassword = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });

  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState("");

  const [passwordForm, setPasswordForm] = useState(emptyPassword);

  const requestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/auth/profile", requestConfig);
      const profile = response.data.user;

      setUser(profile);
      setProfileForm({
        name: profile.name || "",
        phone: profile.phone || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your account. Please try again."
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, []);

  const showMessage = (message) => {
    setError("");
    setSuccess(message);
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        "/auth/profile",
        profileForm,
        requestConfig
      );

      const updatedUser = response.data.user || {
        ...user,
        ...profileForm,
      };

      setUser(updatedUser);
      setProfileForm({
        name: updatedUser.name || "",
        phone: updatedUser.phone || "",
      });

      showMessage("Personal information updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update your information."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;

    setAddressForm({
      ...addressForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetAddressForm = () => {
    setAddressForm(emptyAddress);
    setEditingAddressId("");
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingAddressId) {
        await api.put(
          `/auth/addresses/${editingAddressId}`,
          addressForm,
          requestConfig
        );

        showMessage("Address updated successfully.");
      } else {
        await api.post(
          "/auth/addresses",
          addressForm,
          requestConfig
        );

        showMessage("Address added successfully.");
      }

      resetAddressForm();
      await fetchProfile();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save this address."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      label: address.label || "Home",
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      isDefault: Boolean(address.isDefault),
    });

    setEditingAddressId(address._id);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.delete(
        `/auth/addresses/${addressId}`,
        requestConfig
      );

      await fetchProfile();
      showMessage("Address deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this address."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.patch(
        `/auth/addresses/${addressId}/default`,
        {},
        requestConfig
      );

      await fetchProfile();
      showMessage("Default address updated.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update the default address."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setError("Please fill in all password fields.");
      return;
    }

    if (
      passwordForm.newPassword.length < 8 ||
      passwordForm.newPassword.length > 72
    ) {
      setError("New password must be between 8 and 72 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError(
        "Your new password must be different from your current password."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.patch(
        "/auth/change-password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        requestConfig
      );

      setPasswordForm(emptyPassword);

      showMessage(
        response.data.message || "Password changed successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to change your password. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordFormChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <section className="profile-page">
        <div className="profile-container">
          <p className="profile-message">Loading your account...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="profile-page">
        <div className="profile-container">
          <p className="profile-error">
            {error || "Unable to load your account."}
          </p>
          <button onClick={fetchProfile} className="profile-primary-button">
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const addresses = user.addresses || [];

  return (
    <section className="profile-page">
      <div className="profile-container">
        <div className="profile-heading">
          <div>
            <p className="profile-eyebrow">SNEAKPEAK MEMBER AREA</p>
            <h1>MY ACCOUNT</h1>
            <p>Manage your profile, addresses and orders.</p>
          </div>
        </div>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-user-card">
              <div className="profile-avatar">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <span>MEMBER</span>
            </div>

            <nav className="profile-navigation">
              <button
                className={activeSection === "overview" ? "active" : ""}
                onClick={() => setActiveSection("overview")}
              >
                <span>⌂</span> Overview
              </button>

              <button
                className={activeSection === "personal" ? "active" : ""}
                onClick={() => setActiveSection("personal")}
              >
                <span>♙</span> Personal Information
              </button>

              <button
                className={activeSection === "addresses" ? "active" : ""}
                onClick={() => setActiveSection("addresses")}
              >
                <span>⌖</span> Saved Addresses
              </button>

              <Link to="/orders">
                <span>▤</span> My Orders
              </Link>

              <Link to="/wishlist">
                <span>♡</span> Wishlist
              </Link>

              <button
                className={activeSection === "security" ? "active" : ""}
                onClick={() => setActiveSection("security")}
              >
                <span>♢</span> Security
              </button>
            </nav>

            <button
              className="profile-logout"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              Log Out
            </button>
          </aside>

          <main className="profile-content">
            {error && <div className="profile-error">{error}</div>}
            {success && <div className="profile-success">{success}</div>}

            {activeSection === "overview" && (
              <div className="profile-section">
                <div className="profile-section-heading">
                  <div>
                    <p className="profile-eyebrow">ACCOUNT DASHBOARD</p>
                    <h2>Welcome back, {user.name?.split(" ")[0]}!</h2>
                    <p>Here's your SneakPeak account at a glance.</p>
                  </div>
                </div>

                <div className="profile-stats">
                  <div className="profile-stat-card">
                    <span>PERSONAL DETAILS</span>
                    <strong>{user.phone ? "Complete" : "Incomplete"}</strong>
                    <p>Your contact information</p>
                  </div>

                  <div className="profile-stat-card">
                    <span>SAVED ADDRESSES</span>
                    <strong>{addresses.length}</strong>
                    <p>Delivery addresses</p>
                  </div>
                </div>

                <div className="profile-overview-card">
                  <div>
                    <h3>Personal Information</h3>
                    <p>Keep your contact details up to date.</p>
                  </div>
                  <button
                    onClick={() => setActiveSection("personal")}
                    className="profile-text-button"
                  >
                    Edit Details →
                  </button>
                  <div className="profile-info-grid">
                    <div>
                      <span>FULL NAME</span>
                      <strong>{user.name}</strong>
                    </div>
                    <div>
                      <span>EMAIL ADDRESS</span>
                      <strong>{user.email}</strong>
                    </div>
                    <div>
                      <span>PHONE NUMBER</span>
                      <strong>{user.phone || "Not added"}</strong>
                    </div>
                  </div>
                </div>

                <div className="profile-overview-card">
                  <div>
                    <h3>Saved Addresses</h3>
                    <p>Manage where your sneakers get delivered.</p>
                  </div>
                  <button
                    onClick={() => setActiveSection("addresses")}
                    className="profile-text-button"
                  >
                    Manage Addresses →
                  </button>
                  {addresses.length === 0 ? (
                    <p className="profile-muted">
                      You haven't saved any addresses yet.
                    </p>
                  ) : (
                    addresses.map((address) => (
                      <div className="profile-address-preview" key={address._id}>
                        <strong>
                          {address.label}
                          {address.isDefault && " · DEFAULT"}
                        </strong>
                        <p>
                          {address.addressLine}, {address.city},{" "}
                          {address.state} - {address.pincode}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="profile-quick-links">
                  <Link to="/orders">View My Orders →</Link>
                  <Link to="/wishlist">Explore My Wishlist →</Link>
                  <Link to="/products">Shop Sneakers →</Link>
                </div>
              </div>
            )}

            {activeSection === "personal" && (
              <div className="profile-section">
                <div className="profile-section-heading">
                  <div>
                    <p className="profile-eyebrow">YOUR DETAILS</p>
                    <h2>Personal Information</h2>
                    <p>Update your basic account information.</p>
                  </div>
                </div>

                <form className="profile-form" onSubmit={handleProfileSubmit}>
                  <label>
                    Full Name
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </label>

                  <label>
                    Email Address
                    <input type="email" value={user.email} disabled />
                    <small>Email address cannot be changed here.</small>
                  </label>

                  <label>
                    Phone Number
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                    />
                  </label>

                  <button
                    type="submit"
                    className="profile-primary-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            )}

            {activeSection === "addresses" && (
              <div className="profile-section">
                <div className="profile-section-heading">
                  <div>
                    <p className="profile-eyebrow">DELIVERY DETAILS</p>
                    <h2>Saved Addresses</h2>
                    <p>Add and manage your delivery addresses.</p>
                  </div>
                </div>

                <form
                  className="profile-form profile-address-form"
                  onSubmit={handleAddressSubmit}
                >
                  <h3>
                    {editingAddressId ? "Edit Address" : "Add New Address"}
                  </h3>

                  <label>
                    Address Label
                    <select
                      name="label"
                      value={addressForm.label}
                      onChange={handleAddressChange}
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <div className="profile-form-grid">
                    <label>
                      Full Name
                      <input
                        name="fullName"
                        value={addressForm.fullName}
                        onChange={handleAddressChange}
                        required
                      />
                    </label>

                    <label>
                      Phone Number
                      <input
                        name="phone"
                        type="tel"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        required
                      />
                    </label>
                  </div>

                  <label>
                    House No. / Street / Address
                    <textarea
                      name="addressLine"
                      value={addressForm.addressLine}
                      onChange={handleAddressChange}
                      required
                      rows="3"
                    />
                  </label>

                  <div className="profile-form-grid">
                    <label>
                      City
                      <input
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        required
                      />
                    </label>

                    <label>
                      State
                      <input
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                        required
                      />
                    </label>

                    <label>
                      Pincode
                      <input
                        name="pincode"
                        inputMode="numeric"
                        maxLength="6"
                        value={addressForm.pincode}
                        onChange={handleAddressChange}
                        required
                      />
                    </label>
                  </div>

                  <label className="profile-checkbox">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleAddressChange}
                    />
                    Set as default address
                  </label>

                  <div className="profile-form-actions">
                    <button
                      type="submit"
                      className="profile-primary-button"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editingAddressId
                          ? "Update Address"
                          : "Save Address"}
                    </button>

                    {editingAddressId && (
                      <button
                        type="button"
                        className="profile-secondary-button"
                        onClick={resetAddressForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="profile-saved-addresses">
                  <h3>Your Addresses ({addresses.length})</h3>

                  {addresses.length === 0 ? (
                    <p className="profile-muted">
                      No saved addresses. Add your first delivery address above.
                    </p>
                  ) : (
                    addresses.map((address) => (
                      <article className="profile-address-card" key={address._id}>
                        <div className="profile-address-card-heading">
                          <strong>{address.label}</strong>
                          {address.isDefault && (
                            <span className="profile-default-badge">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        <p>{address.fullName}</p>
                        <p>{address.addressLine}</p>
                        <p>
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p>Phone: {address.phone}</p>

                        <div className="profile-address-actions">
                          <button
                            onClick={() => handleEditAddress(address)}
                            disabled={saving}
                          >
                            Edit
                          </button>

                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefault(address._id)}
                              disabled={saving}
                            >
                              Set Default
                            </button>
                          )}

                          <button
                            className="profile-delete-button"
                            onClick={() => handleDeleteAddress(address._id)}
                            disabled={saving}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSection === "security" && (
              <div className="profile-section">
                <div className="profile-section-heading">
                  <div>
                    <p className="profile-eyebrow">ACCOUNT PROTECTION</p>
                    <h2>Security</h2>
                    <p>Keep your SneakPeak account safe and secure.</p>
                  </div>
                </div>

                <div className="profile-overview-card">
                  <h3>Password & Login</h3>
                  <p>
                    Change your password regularly to help protect your account.
                  </p>

                  <form
                    className="profile-form"
                    onSubmit={handlePasswordChange}
                  >
                    <label>
                      Current Password
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                        required
                      />
                    </label>

                    <label>
                      New Password
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="Enter your new password"
                        autoComplete="new-password"
                        minLength="8"
                        maxLength="72"
                        required
                      />
                    </label>

                    <label>
                      Confirm New Password
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="Confirm your new password"
                        autoComplete="new-password"
                        minLength="8"
                        maxLength="72"
                        required
                      />
                    </label>

                    <button
                      type="submit"
                      className="profile-primary-button"
                      disabled={saving}
                    >
                      {saving ? "Updating Password..." : "Change Password"}
                    </button>
                  </form>
                </div>

                <div className="profile-overview-card">
                  <h3>Account Information</h3>
                  <div className="profile-info-grid">
                    <div>
                      <span>ACCOUNT EMAIL</span>
                      <strong>{user.email}</strong>
                    </div>
                    <div>
                      <span>ACCOUNT TYPE</span>
                      <strong>{user.role || "Customer"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}

export default Profile;
