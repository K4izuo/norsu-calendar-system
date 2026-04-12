"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { UserLoginForm } from "@/features/auth/components/login/user-login-form"
import { useLoginForm } from "@/features/auth/hooks/useLoginForm"

export default function UserLoginPage() {
  const {
    form,
    formData,
    errors,
    showPassword,
    rememberMe,
    isLoading: formLoading,
    isSuccess,
    handlePasswordToggle,
    handleRememberMeChange,
    handleSubmit,
  } = useLoginForm()

  return (
    <div className="min-h-dvh w-full font-['Poppins'] flex relative bg-white overflow-hidden">

      {/* ── CLIP-PATH DEFINITIONS ── */}
      <svg width="0" height="0" style={{ position: "absolute", overflow: "hidden" }} aria-hidden="true">
        <defs>
          {/*
            Both curves shifted right +0.03 vs original (baselines 0.87→0.90, 0.93→0.96).
            All x coords (baseline + control points) shifted by the same delta so the
            S-shape is identical and the blending condition is preserved:
              illustration at y=0.5 → x = 0.25×0.90 + 0.375×(0.73+1.07) = 0.90
              glass at y=0.5       → x = 0.25×0.96 + 0.375×(0.71+1.05) = 0.90 ✓
          */}
          <clipPath id="clipIllustration" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 0.90,0 C 0.73,0.33 1.07,0.67 0.90,1 L 0,1 Z" />
          </clipPath>
          <clipPath id="clipGlass" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 0.96,0 C 0.71,0.33 1.05,0.67 0.96,1 L 0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Glass/transparent wave — sits behind illustration, peeks out as a soft glass edge */}
      <div
        className="hidden md:block absolute top-0 left-0 h-full"
        style={{
          width: "62%",
          background: "rgba(180, 225, 242, 0.45)",
          clipPath: "url(#clipGlass)",
          WebkitClipPath: "url(#clipGlass)",
          zIndex: 1,
        }}
      />

      {/* ── LEFT: Illustration panel — narrowest S-curve, top layer ── */}
      <div
        className="hidden md:block relative bg-[#c5e7f3]"
        style={{
          flex: "0 0 62%",
          clipPath: "url(#clipIllustration)",
          WebkitClipPath: "url(#clipIllustration)",
          zIndex: 3,
        }}
      >
        <Image
          src="/images/NORSU.jpg"
          alt="NORSU Campus"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* ── RIGHT: White form panel ── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex-1 bg-white flex flex-col justify-center min-h-dvh"
      >
        {/*
          Shift form content left by ~7% of the panel width so it appears visually
          centered in the visible white area (S-wave edge → right edge), not just
          centered within the 38% panel. S-wave and panel are untouched.
        */}
        <div style={{ transform: "translateX(-5%)" }}>
          <UserLoginForm
            showPassword={showPassword}
            rememberMe={rememberMe}
            isLoading={formLoading}
            isSuccess={isSuccess}
            formData={formData}
            errors={errors}
            onShowPasswordToggle={handlePasswordToggle}
            onRememberMeChange={handleRememberMeChange}
            onSubmit={handleSubmit}
            register={form.register}
          />
        </div>
      </motion.div>

    </div>
  )
}
