import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import {
  registerForEvent,
  unregisterFromEvent,
} from "../../slices/eventSlice";
import isPastEvent from "./isPastEvent";

/** "X registered" or "X/Y registered" micro-label. */
export const RegistrationCount = ({ event, className = "" }) => {
  const count = useSelector(
    (state) => state.events.registrationCounts[event.id] ?? 0
  );
  const max = event?.max_participants;
  return (
    <span
      className={`font-mono text-[11px] uppercase tracking-widest text-dim ${className}`}
    >
      {max ? `${count}/${max} registered` : `${count} registered`}
    </span>
  );
};

/**
 * Register / Registered / Full toggle pill.
 * Hidden for past events. Prompts guests to log in.
 */
const RegisterButton = ({ event, compact = false, className = "" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const isRegistered = useSelector((state) =>
    state.events.myRegistrations.includes(event?.id)
  );
  const isBusy = useSelector(
    (state) => !!state.events.registering[event?.id]
  );
  const count = useSelector(
    (state) => state.events.registrationCounts[event?.id] ?? 0
  );

  const max = event?.max_participants;
  const isFull = max != null && !isRegistered && count >= max;

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (isBusy || isFull) return;
      if (!isAuthenticated) {
        toast("Log in to register for events", { icon: "🔑" });
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      if (isRegistered) {
        dispatch(unregisterFromEvent(event.id));
      } else {
        dispatch(registerForEvent(event.id));
      }
    },
    [
      dispatch,
      navigate,
      location.pathname,
      isAuthenticated,
      isRegistered,
      isBusy,
      isFull,
      event?.id,
    ]
  );

  if (!event || isPastEvent(event)) return null;

  const base = `inline-flex items-center justify-center gap-1.5 rounded-full font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${
    compact ? "px-4 py-1.5" : "px-6 py-2.5"
  }`;

  if (isFull) {
    return (
      <button
        type="button"
        disabled
        onClick={(e) => e.stopPropagation()}
        className={`${base} border border-ink-line text-dim cursor-not-allowed ${className}`}
        title="This event has reached capacity"
      >
        Full
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      aria-pressed={isRegistered}
      className={`${base} ${
        isRegistered
          ? "border border-beacon text-beacon hover:border-beacon-soft hover:text-beacon-soft"
          : "bg-beacon text-ink hover:bg-beacon-soft"
      } ${isBusy ? "opacity-60 cursor-wait" : ""} ${className}`}
      title={
        !isAuthenticated
          ? "Log in to register"
          : isRegistered
          ? "Cancel registration"
          : "Register for this event"
      }
    >
      {isBusy ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isRegistered ? (
        <Check className="w-3.5 h-3.5" />
      ) : null}
      {isRegistered ? "Registered" : "Register"}
    </button>
  );
};

export default RegisterButton;
