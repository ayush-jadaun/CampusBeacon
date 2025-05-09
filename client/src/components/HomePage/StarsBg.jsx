import React, { useRef, useEffect, useMemo, useCallback } from "react";

const StarryBackground = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const starsRef = useRef([]);
  const animationFrameId = useRef(null);

  const starBaseRadius = 0.8;
  const starCountConfig = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(max-width: 768px)").matches ? 70 : 100;
    }
    return 100;
  }, []);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  }, []);

  const initializeStars = useCallback(
    (canvas) => {
      const { width, height } = canvas;
      starsRef.current = [];
      for (let i = 0; i < starCountConfig; i++) {
        const maxAlpha = Math.random() * 0.5 + 0.3;
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * starBaseRadius + starBaseRadius * 0.5 * 2,
          alpha: Math.random() * maxAlpha,
          maxAlpha: maxAlpha,
          phase: Math.random() * Math.PI * 2,
          velocity: Math.random() * 0.02 + 0.005,
        });
      }
    },
    [starCountConfig, starBaseRadius]
  );

  const drawStars = useCallback((ctx, canvas, time) => {
    // Fill with black background first to prevent any transparency issues
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    starsRef.current.forEach((star) => {
      star.phase += star.velocity;
      const currentAlphaFactor = Math.abs(Math.sin(star.phase));
      star.alpha = star.maxAlpha * currentAlphaFactor;

      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  const animate = useCallback(
    (time) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      drawStars(ctx, canvas, time);

      animationFrameId.current = requestAnimationFrame(animate);
    },
    [drawStars]
  );

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    initializeStars(canvas);

    // Always draw immediately after resize
    drawStars(ctx, canvas, 0);
  }, [initializeStars, prefersReducedMotion, drawStars]);

  // Handle scroll events specifically
  const handleTouchScroll = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Redraw during scroll to prevent white flashes
    drawStars(ctx, canvas, 0);
  }, [drawStars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const container = containerRef.current;

    if (!canvas || !ctx) {
      console.error("Canvas context not available");
      return;
    }

    handleResize();

    if (!prefersReducedMotion) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      drawStars(ctx, canvas, 0);
    }

    window.addEventListener("resize", handleResize);
    // Add scroll-related event listeners
    window.addEventListener("scroll", handleTouchScroll, { passive: true });
    window.addEventListener("touchmove", handleTouchScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleTouchScroll);
      window.removeEventListener("touchmove", handleTouchScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    prefersReducedMotion,
    animate,
    handleResize,
    initializeStars,
    drawStars,
    handleTouchScroll,
  ]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black -z-10"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{
          imageRendering: "pixelated",
          backgroundColor: "black", // Ensure the canvas itself has a black background
          position: "absolute", // Ensure it stays fixed in place
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    </div>
  );
};

export default StarryBackground;
