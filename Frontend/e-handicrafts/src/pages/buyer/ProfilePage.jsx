import React, { useState } from "react";
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock } from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, changePassword } from "../../services/api";
import toast from "react-hot-toast";
import "./Profile.css";

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
  });
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("phone", profileForm.phone);
      formData.append(
        "address",
        JSON.stringify({
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          pincode: profileForm.pincode,
        }),
      );
      await updateProfile(formData);
      await refreshUser();
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success("Password changed!");
      setPassForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container profile-page fade-in">
        <div className="profile-header card">
          <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
            <span
              className={`badge ${user?.role === "admin" ? "badge-danger" : user?.role === "seller" ? "badge-warning" : "badge-primary"}`}
            >
              {user?.role}
            </span>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${tab === "profile" ? "active" : ""}`}
            onClick={() => setTab("profile")}
          >
            <FiUser /> Profile Info
          </button>
          <button
            className={`tab-btn ${tab === "password" ? "active" : ""}`}
            onClick={() => setTab("password")}
          >
            <FiLock /> Change Password
          </button>
        </div>

        {tab === "profile" && (
          <div className="card profile-form-card">
            <form onSubmit={handleProfileSave}>
              <h2>Personal Information</h2>
              <div className="form-row-2">
                <div className="form-group">
                  <label>
                    <FiUser /> Full Name
                  </label>
                  <input
                    className="form-control"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FiPhone /> Phone
                  </label>
                  <input
                    className="form-control"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <FiMail /> Email (read-only)
                </label>
                <input className="form-control" value={user?.email} disabled />
              </div>
              <h3 style={{ margin: "20px 0 14px", fontSize: "1rem" }}>
                <FiMapPin style={{ verticalAlign: "middle" }} /> Address
              </h3>
              <div className="form-group">
                <label>Street</label>
                <input
                  className="form-control"
                  value={profileForm.street}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, street: e.target.value })
                  }
                />
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>City</label>
                  <input
                    className="form-control"
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, city: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    className="form-control"
                    value={profileForm.state}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, state: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    className="form-control"
                    value={profileForm.pincode}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        pincode: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {tab === "password" && (
          <div className="card profile-form-card">
            <form onSubmit={handlePasswordChange}>
              <h2>Change Password</h2>
              {["currentPassword", "newPassword", "confirmPassword"].map(
                (field) => (
                  <div className="form-group" key={field}>
                    <label>
                      {field === "currentPassword"
                        ? "Current Password"
                        : field === "newPassword"
                          ? "New Password"
                          : "Confirm New Password"}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={passForm[field]}
                      onChange={(e) =>
                        setPassForm({ ...passForm, [field]: e.target.value })
                      }
                    />
                  </div>
                ),
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
