import React, { useState, useRef, useEffect } from "react";

const CustomEmailInput = ({
  name,
  required = true,
  autoComplete = "username",
  onChange,
  label = "Email",
  initialUsername = "",
  domain = "@mnnit.ac.in",
}) => {
  const [username, setUsername] = useState(initialUsername);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const inputId = `${name}-input`;
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  useEffect(() => {
    if (onChange) {
      const fullEmail = username ? username + domain : "";
      onChange({ target: { name, value: fullEmail } });
    }
  }, [username, name, domain, onChange]);

  const handleUsernameChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setUsername("");
      setError("");
      return;
    }

    if (/^[a-zA-Z0-9_.]*$/.test(value)) {
      setUsername(value);
      setError("");
    } else {
      setUsername(value);
      setError(
        "Username can only contain letters (a-z, A-Z), numbers (0-9), dots (.), and underscores (_)."
      );
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (username && !/^[a-zA-Z0-9_.]+$/.test(username)) {
      setError(
        "Username contains invalid characters. Allowed: letters, numbers, dots, underscores."
      );
    } else if (required && !username) {
      setError("This field is required.");
    } else {
      if (error && /^[a-zA-Z0-9_.]+$/.test(username)) {
        setError("");
      }
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleClearClick = (e) => {
    e.stopPropagation();
    setUsername("");
    setError("");
    inputRef.current?.focus();
  };

  const fullEmailValue = username ? username + domain : "";

  return (
    <div className="w-full max-w-lg mx-auto">
      <input type="hidden" name={name} value={fullEmailValue} />
      <label
        htmlFor={inputId}
        className="block font-mono text-xs uppercase tracking-widest text-dim mb-2"
      >
        {label} {required && <span className="text-beacon">*</span>}
      </label>
      <div
        onClick={handleContainerClick}
        className={`flex items-center w-full overflow-hidden bg-ink rounded-sm text-paper border transition-colors duration-150 ease-in-out ${
          isFocused
            ? "border-beacon"
            : error
            ? "border-red-400"
            : "border-ink-line hover:border-dim/50"
        }`}
      >
        <div className="relative flex-grow">
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            value={username}
            onChange={handleUsernameChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder="name.registration_number"
            className="w-full p-3 md:p-4 bg-transparent focus:outline-none text-paper placeholder-dim"
            required={required}
            autoComplete={autoComplete}
            aria-label={`${label} Username`}
            aria-describedby={`${hintId}${error ? ` ${errorId}` : ""}`}
            aria-invalid={!!error}
          />
          {username && (
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-dim hover:text-paper focus:outline-none focus:ring-1 focus:ring-beacon rounded-full p-0.5"
              onClick={handleClearClick}
              aria-label="Clear username input"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="py-3 px-3 md:px-4 bg-ink-3 text-dim whitespace-nowrap font-mono text-sm md:text-base flex-shrink-0 border-l border-ink-line">
          {domain}
        </div>
      </div>
      <div className="min-h-[1.25rem] mt-1">
        {error && (
          <p id={errorId} className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="mt-2 flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-beacon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p id={hintId} className="ml-2 text-xs md:text-sm text-dim">
          Enter only your username (e.g.,{" "}
          <span className="font-medium text-paper">john.2022ca045</span>).
          The domain <span className="font-mono text-paper">{domain}</span>{" "}
          will be appended automatically.
        </p>
      </div>

      {/* Email preview with fixed height to prevent layout shifts */}
      <div className="mt-3 h-[42px] transition-opacity duration-200">
          <div className="p-2 bg-ink border border-ink-line rounded-sm text-sm text-paper font-mono break-all">
            <span className="font-normal text-dim">Email preview: </span>
            {username}
            <span className="text-beacon">{domain}</span>
          </div>

      </div>
    </div>
  );
};

export default CustomEmailInput;
