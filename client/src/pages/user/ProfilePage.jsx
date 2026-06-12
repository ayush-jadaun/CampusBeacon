import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Book,
  Hash,
  Star,
  Edit,
  Home,
  AlertCircle,
  Save,
  X,
  Check,
} from "lucide-react";
import Profile from "../../components/ProfilePage/profileCard";
import LoadingScreen from "../../components/LoadingScreen";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUser,
  setIsEditing,
  clearError,
  getUser,
} from "../../slices/profileSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isEditing, loading, error } = useSelector(
    (state) => state.profile
  );
  const [notification, setNotification] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    branch: "",
    semester: "",
    graduation_year: 2025,
    hostel: "",
  });

  const branchOptions = [
    "Electronics and Communication Engineering",
    "Computer Science Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Engineering and Computational Mechanics",
    "Chemical Engineering",
    "Material Engineering",
    "Production and Industrial Engineering",
    "Biotechnology",
  ];

  const semesterOptions = [
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
    "Sixth",
    "Seventh",
    "Eighth",
  ];

  const hostelOptions = [
    "SVBH",
    "DGJH",
    "Tilak",
    "Malviya",
    "Patel",
    "Tandon",
    "PG",
  ];

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const newUserData = {
        name: user.name || "",
        email: user.email || "",
        branch: user.branch || "",
        semester: user.semester || "",
        graduation_year: user.graduation_year || 2025,
        hostel: user.hostel || "",
      };
      setUserData(newUserData);
      setOriginalData(newUserData);
    }
  }, [user]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setUserData(originalData);
    dispatch(setIsEditing(false));
  };

  const handleSubmit = async () => {
    try {
      const formData = {
        name: userData.name,
        branch: userData.branch,
        semester: userData.semester,
        hostel: userData.hostel,
      };

      await dispatch(updateUser(formData)).unwrap();
      dispatch(setIsEditing(false));
      showNotification("Profile updated successfully!");
      setOriginalData(userData);
    } catch (err) {
      showNotification("Error updating profile", "error");
      console.error("Error updating profile:", err);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="bg-ink-2 border border-red-500/40 text-red-400 p-4 rounded-sm flex items-center">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      </div>
    );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="bg-ink-2 border border-red-500/40 text-red-400 p-4 rounded-sm flex items-center">
          <AlertCircle className="mr-2" />
          User not found.
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Semester",
      value: userData.semester,
      icon: Book,
      isSelect: true,
    },
    {
      label: "Registration",
      value: user.registration_number,
      icon: Hash,
      name: "registration_number",
      readonly: true,
    },
    {
      label: "Hostel",
      value: userData.hostel,
      icon: Home,
      isSelect: true,
      options: hostelOptions,
    },
  ];

  return (
    <div className="relative min-h-screen bg-ink text-paper py-24 px-4 overflow-hidden">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-sm bg-ink-2 shadow-[0_10px_30px_rgba(0,0,0,0.45)] flex items-center space-x-2 border ${
              notification.type === "error"
                ? "border-red-500/50"
                : "border-green-500/50"
            }`}
          >
            {notification.type === "error" ? (
              <AlertCircle size={20} className="text-red-400" />
            ) : (
              <Check size={20} className="text-green-400" />
            )}
            <span className="text-paper">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-dim hover:text-paper"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-beacon tracking-[0.25em] uppercase">
            ( Profile )
          </span>
          <span className="h-px flex-1 bg-ink-line" aria-hidden="true" />
        </div>
      </div>

      <motion.div
        className="max-w-6xl mx-auto bg-ink-2 rounded-sm p-6 sm:p-12 relative border border-ink-line"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-4 right-4">
          <motion.button
            onClick={() =>
              isEditing ? handleCancel() : dispatch(setIsEditing(true))
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-full focus:outline-none transition-colors border ${
              isEditing
                ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                : "border-ink-line text-dim hover:border-beacon hover:text-beacon"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isEditing ? (
              <>
                <X className="w-5 h-5" /> Cancel
              </>
            ) : (
              <>
                <Edit className="w-5 h-5" /> Edit Profile
              </>
            )}
          </motion.button>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
              <div className="w-full">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        placeholder="Your Name"
                        className="font-display text-3xl font-semibold text-paper bg-transparent border-b-2 border-ink-line focus:outline-none w-full placeholder:text-dim transition-colors focus:border-beacon"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        disabled
                        className="w-full bg-ink border border-ink-line text-dim rounded-sm p-4"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="font-display text-5xl pb-3 font-semibold text-paper mb-2">
                      {userData.name || "Name"}
                    </h1>
                    <p className="font-mono text-sm text-dim">
                      {userData.email}
                    </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-auto">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1.5">
                        Branch
                      </label>
                      <select
                        name="branch"
                        value={userData.branch}
                        onChange={handleChange}
                        className="w-full bg-ink border border-ink-line text-paper rounded-sm p-2 focus:outline-none focus:border-beacon transition-colors"
                      >
                        <option value="" className="bg-ink">
                          Select Branch
                        </option>
                        {branchOptions.map((branch) => (
                          <option
                            key={branch}
                            value={branch}
                            className="bg-ink"
                          >
                            {branch}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <Profile
                      vals={userData.branch || "Branch"}
                      header="Branch"
                    />
                    <Profile
                      vals={userData.graduation_year || "Graduation Year"}
                      header="Graduation Year"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05 }}
                  className="bg-ink rounded-sm p-6 text-center relative group hover:border-beacon/50 transition-colors border border-ink-line"
                >
                  <stat.icon className="w-6 h-6 text-beacon mx-auto mb-3" />
                  {isEditing && !stat.readonly ? (
                    stat.isSelect ? (
                      <select
                        name={stat.name || stat.label.toLowerCase()}
                        value={userData[stat.name || stat.label.toLowerCase()]}
                        onChange={handleChange}
                        className="w-full bg-ink border border-ink-line text-paper text-xl font-semibold rounded-sm p-2 text-center focus:outline-none focus:border-beacon transition-colors"
                      >
                        <option value="" className="bg-ink">
                          Select {stat.label}
                        </option>
                        {(stat.options || semesterOptions).map((option) => (
                          <option key={option} value={option} className="bg-ink">
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={stat.name || stat.label.toLowerCase()}
                        value={userData[stat.name || stat.label.toLowerCase()]}
                        onChange={handleChange}
                        placeholder={stat.label}
                        className="w-full bg-transparent text-center text-paper text-xl font-semibold border-b border-ink-line focus:border-beacon focus:outline-none transition-colors"
                      />
                    )
                  ) : (
                    <p className="font-display text-paper text-xl font-semibold mb-1">
                      {stat.value || stat.label}
                    </p>
                  )}
                  <p className="font-mono text-xs uppercase tracking-widest text-dim mt-2">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {isEditing && (
              <motion.div
                className="mt-6 flex justify-end"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-beacon text-ink font-semibold px-7 py-2.5 rounded-full hover:bg-beacon-soft focus:outline-none transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </motion.button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center font-mono text-xs text-dim"
            >
              Last updated: {new Date().toLocaleString()}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-ink-2 border-t border-ink-line md:hidden"
          >
            <div className="flex gap-4">
              <motion.button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 border border-red-500/50 text-red-400 px-4 py-3 rounded-full"
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 bg-beacon text-ink font-semibold px-4 py-3 rounded-full"
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-5 h-5" />
                Save
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
