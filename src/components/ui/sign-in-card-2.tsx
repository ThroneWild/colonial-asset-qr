"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeClosed,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

const iconVariants = {
  email: Mail,
  user: UserRound,
};

type FocusedInput = "identifier" | "password" | null;

interface SignInCardProps {
  title?: string;
  subtitle?: string;
  identifierPlaceholder?: string;
  identifierType?: React.ComponentProps<"input">["type"];
  identifierMode?: "email" | "user";
  forgotPasswordHref?: string;
  signupHref?: string;
  submitLabel?: string;
  loading?: boolean;
  onSubmit?: (values: {
    identifier: string;
    password: string;
    rememberMe: boolean;
  }) => Promise<void> | void;
}

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export function SignInCard({
  title = "Welcome Back",
  subtitle = "Sign in to continue",
  identifierPlaceholder = "Email address",
  identifierType = "email",
  identifierMode = "email",
  forgotPasswordHref,
  signupHref,
  submitLabel = "Sign In",
  loading,
  onSubmit,
}: SignInCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [internalLoading, setInternalLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const IconComponent = useMemo(() => iconVariants[identifierMode] ?? Mail, [identifierMode]);

  const isControlled = typeof loading === "boolean";

  useEffect(() => {
    if (isControlled) {
      setInternalLoading(loading);
    }
  }, [isControlled, loading]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit) {
      if (!isControlled) {
        setInternalLoading(true);
      }

      try {
        await onSubmit({ identifier, password, rememberMe });
      } finally {
        if (!isControlled) {
          setInternalLoading(false);
        }
      }
      return;
    }

    setInternalLoading(true);
    setTimeout(() => setInternalLoading(false), 2000);
  };

  const isLoading = internalLoading;

  return (
    <div className="w-full max-w-sm" style={{ perspective: 1500 }}>
      <motion.div
        className="relative"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ z: 10 }}
      >
        <div className="group relative">
          <motion.div
            className="absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-70"
            animate={{
              boxShadow: [
                "0 0 10px 2px rgba(255,255,255,0.03)",
                "0 0 15px 5px rgba(255,255,255,0.05)",
                "0 0 10px 2px rgba(255,255,255,0.03)",
              ],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror",
            }}
          />

          <div className="absolute -inset-[1px] overflow-hidden rounded-2xl">
            <motion.div
              className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
              initial={{ filter: "blur(2px)" }}
              animate={{
                left: ["-50%", "100%"],
                opacity: [0.3, 0.7, 0.3],
                filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"],
              }}
              transition={{
                left: {
                  duration: 2.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1,
                },
                opacity: {
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "mirror",
                },
                filter: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                },
              }}
            />

            <motion.div
              className="absolute right-0 top-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
              initial={{ filter: "blur(2px)" }}
              animate={{
                top: ["-50%", "100%"],
                opacity: [0.3, 0.7, 0.3],
                filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"],
              }}
              transition={{
                top: {
                  duration: 2.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 0.6,
                },
                opacity: {
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 0.6,
                },
                filter: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 0.6,
                },
              }}
            />

            <motion.div
              className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
              initial={{ filter: "blur(2px)" }}
              animate={{
                right: ["-50%", "100%"],
                opacity: [0.3, 0.7, 0.3],
                filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"],
              }}
              transition={{
                right: {
                  duration: 2.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 1.2,
                },
                opacity: {
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1.2,
                },
                filter: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1.2,
                },
              }}
            />

            <motion.div
              className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
              initial={{ filter: "blur(2px)" }}
              animate={{
                bottom: ["-50%", "100%"],
                opacity: [0.3, 0.7, 0.3],
                filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"],
              }}
              transition={{
                bottom: {
                  duration: 2.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 1.8,
                },
                opacity: {
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1.8,
                },
                filter: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1.8,
                },
              }}
            />

            <motion.div
              className="absolute left-0 top-0 h-[5px] w-[5px] rounded-full bg-white/40"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
            />
            <motion.div
              className="absolute right-0 top-0 h-[8px] w-[8px] rounded-full bg-white/60"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
            />
            <motion.div
              className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror", delay: 1 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2.3, repeat: Infinity, repeatType: "mirror", delay: 1.5 }}
            />
          </div>

          <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/3 via-white/7 to-white/3 opacity-0 transition-opacity duration-500 group-hover:opacity-70" />

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)",
                backgroundSize: "30px 30px",
              }}
            />

            <div className="relative mb-5 space-y-1 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="relative mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10"
              >
                <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-lg font-bold text-transparent">
                  S
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-xl font-bold text-transparent"
              >
                {title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-white/60"
              >
                {subtitle}
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div className="space-y-3">
                <motion.div
                  className={cn("relative", focusedInput === "identifier" && "z-10")}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="absolute -inset-[0.5px] rounded-lg bg-gradient-to-r from-white/10 via-white/5 to-white/10 opacity-0 transition-all duration-300 group-hover:opacity-100" />

                  <div className="relative flex items-center overflow-hidden rounded-lg">
                    <IconComponent
                      className={cn(
                        "absolute left-3 h-4 w-4 transition-all duration-300",
                        focusedInput === "identifier" ? "text-white" : "text-white/40"
                      )}
                    />

                    <Input
                      type={identifierType}
                      placeholder={identifierPlaceholder}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      onFocus={() => setFocusedInput("identifier")}
                      onBlur={() => setFocusedInput(null)}
                      className="h-10 w-full bg-white/5 pl-10 pr-3 text-white placeholder:text-white/30 transition-all duration-300 focus:bg-white/10 focus:border-transparent"
                      autoComplete={identifierType === "email" ? "email" : "username"}
                      required
                    />

                    {focusedInput === "identifier" && (
                      <motion.div
                        layoutId="input-highlight"
                        className="absolute inset-0 -z-10 bg-white/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>
                </motion.div>

                <motion.div
                  className={cn("relative", focusedInput === "password" && "z-10")}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="absolute -inset-[0.5px] rounded-lg bg-gradient-to-r from-white/10 via-white/5 to-white/10 opacity-0 transition-all duration-300 group-hover:opacity-100" />

                  <div className="relative flex items-center overflow-hidden rounded-lg">
                    <Lock
                      className={cn(
                        "absolute left-3 h-4 w-4 transition-all duration-300",
                        focusedInput === "password" ? "text-white" : "text-white/40"
                      )}
                    />

                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                      className="h-10 w-full bg-white/5 pl-10 pr-10 text-white placeholder:text-white/30 transition-all duration-300 focus:bg-white/10 focus:border-transparent"
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 text-white/40 transition-colors duration-300 hover:text-white"
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeClosed className="h-4 w-4" />
                      )}
                    </button>

                    {focusedInput === "password" && (
                      <motion.div
                        layoutId="input-highlight"
                        className="absolute inset-0 -z-10 bg-white/5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>
                </motion.div>
              </motion.div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-white/60 transition-colors duration-200 hover:text-white/80">
                  <div className="relative">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe((prev) => !prev)}
                      className="h-4 w-4 appearance-none rounded border border-white/20 bg-white/5 transition-all duration-200 checked:border-white checked:bg-white focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                    {rememberMe && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="pointer-events-none absolute inset-0 flex items-center justify-center text-black"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  <span>Remember me</span>
                </label>

                <div className="text-xs">
                  {forgotPasswordHref ? (
                    <Link
                      to={forgotPasswordHref}
                      className="text-white/60 transition-colors duration-200 hover:text-white"
                    >
                      Forgot password?
                    </Link>
                  ) : null}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="group/button relative mt-5 w-full"
              >
                <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 blur-lg transition-opacity duration-300 group-hover/button:opacity-70" />

                <div className="relative flex h-10 items-center justify-center overflow-hidden rounded-lg bg-white text-black font-medium transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 -z-10 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    style={{
                      opacity: isLoading ? 1 : 0,
                      transition: "opacity 0.3s ease",
                    }}
                  />

                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/70 border-t-transparent" />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="button-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-1 text-sm font-medium"
                      >
                        {submitLabel}
                        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/button:translate-x-1" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>

              <div className="relative my-5 flex items-center">
                <div className="flex-grow border-t border-white/5" />
                <motion.span
                  className="mx-3 text-xs text-white/40"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: [0.7, 0.9, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  or
                </motion.span>
                <div className="flex-grow border-t border-white/5" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="group/google relative w-full"
              >
                <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 blur transition-opacity duration-300 group-hover/google:opacity-70" />

                <div className="relative flex h-10 items-center justify-center gap-2 overflow-hidden rounded-lg border border-white/10 bg-white/5 text-white transition-all duration-300 hover:border-white/20">
                  <div className="flex h-4 w-4 items-center justify-center text-white/80 transition-colors duration-300 group-hover/google:text-white">
                    G
                  </div>

                  <span className="text-xs text-white/80 transition-colors group-hover/google:text-white">
                    Sign in with Google
                  </span>

                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                </div>
              </motion.button>

              {signupHref ? (
                <motion.p
                  className="mt-4 text-center text-xs text-white/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Don&apos;t have an account?{" "}
                  <Link
                    to={signupHref}
                    className="group/signup relative inline-block font-medium text-white transition-colors duration-300 hover:text-white/70"
                  >
                    <span className="relative z-10">Sign up</span>
                    <span className="absolute bottom-0 left-0 h-px w-0 bg-white transition-all duration-300 group-hover/signup:w-full" />
                  </Link>
                </motion.p>
              ) : null}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Component(props: SignInCardProps) {
  return <SignInCard {...props} />;
}
