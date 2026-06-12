import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Import icons from lucide-react

const PasswordInput = ({ name, placeholder, required, autoComplete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-2">
        Password
      </label>
      <div
        className={`flex items-center w-full p-4 bg-ink rounded-sm text-paper border ${
          isFocused ? "border-beacon" : "border-ink-line"
        } transition-colors`}
      >
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          className="bg-transparent focus:outline-none w-full text-paper placeholder-dim"
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="text-dim hover:text-paper focus:outline-none transition-colors"
          tabIndex="-1"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
