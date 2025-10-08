"use client";

import { Input } from "@heroui/react";
import { useMemo, useState } from "react";

export interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  autoComplete?: string;
  ariaDescribedBy?: string;
  isInvalid?: boolean;
  errorMessage?: string;
}

export default function PasswordField({
  value,
  onChange,
  label = "Contraseña",
  placeholder = "Contraseña",
  isRequired = true,
  autoComplete = "new-password",
  ariaDescribedBy,
  isInvalid,
  errorMessage,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const requirements = useMemo(() => ({
    minLength: (value || "").length >= 8,
    hasNumber: /[0-9]/.test(value || ""),
    hasLowercase: /[a-z]/.test(value || ""),
    hasUppercase: /[A-Z]/.test(value || ""),
  }), [value]);

  const strength: 0 | 1 | 2 | 3 | 4 = useMemo(() => {
    if (!value) return 0;
    const met = Object.values(requirements).filter(Boolean).length;
    if (met === 1) return 1;
    if (met === 2) return 2;
    if (met === 3) return 3;
    if (met === 4) return 4;
    return 0;
  }, [value, requirements]);

  return (
    <div className="w-full">
      <Input
        className="w-full"
        type={showPassword ? "text" : "password"}
        isRequired={isRequired}
        variant="bordered"
        placeholder={placeholder}
        label={label}
        labelPlacement="outside"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={[ariaDescribedBy, "password-requirements", "password-strength"].filter(Boolean).join(" ") || undefined}
        autoComplete={autoComplete}
        isInvalid={isInvalid}
        errorMessage={errorMessage}
        endContent={
          <button
            type="button"
            className="focus:outline-none cursor-pointer"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        }
      />

      <div className="mt-2" id="password-strength">
        <div
          className="flex gap-1 mb-1"
          role="progressbar"
          aria-valuenow={strength}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-label="Fortaleza de la contraseña"
        >
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1 flex-1 rounded-full ${
                strength >= level
                  ? strength === 1
                    ? "bg-red-500"
                    : strength === 2
                    ? "bg-orange-500"
                    : strength === 3
                    ? "bg-yellow-500"
                    : "bg-green-500"
                  : "bg-gray-200"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        {value && (
          <p
            className={`text-xs ${
              strength === 0
                ? "text-gray-500"
                : strength === 1
                ? "text-red-500"
                : strength === 2
                ? "text-orange-500"
                : strength === 3
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {strength === 0
              ? "Ingrese una contraseña"
              : strength === 1
              ? "Contraseña débil"
              : strength === 2
              ? "Contraseña media"
              : strength === 3
              ? "Contraseña fuerte"
              : "Contraseña muy fuerte"}
          </p>
        )}
      </div>

      <div className="mt-2" id="password-requirements">
        <p className="text-sm">Debe contener:</p>
        <ul className="text-xs space-y-1 mt-1" role="list">
          <li
            className={`flex items-center gap-1 ${
              requirements.minLength ? "text-green-500" : "text-gray-500"
            }`}
            role="listitem"
          >
            <span aria-hidden="true">{requirements.minLength ? "✓" : "✗"}</span>
            <span>Al menos 8 caracteres</span>
          </li>
          <li
            className={`flex items-center gap-1 ${
              requirements.hasNumber ? "text-green-500" : "text-gray-500"
            }`}
            role="listitem"
          >
            <span aria-hidden="true">{requirements.hasNumber ? "✓" : "✗"}</span>
            <span>Al menos 1 número</span>
          </li>
          <li
            className={`flex items-center gap-1 ${
              requirements.hasLowercase ? "text-green-500" : "text-gray-500"
            }`}
            role="listitem"
          >
            <span aria-hidden="true">{requirements.hasLowercase ? "✓" : "✗"}</span>
            <span>Al menos 1 letra minúscula</span>
          </li>
          <li
            className={`flex items-center gap-1 ${
              requirements.hasUppercase ? "text-green-500" : "text-gray-500"
            }`}
            role="listitem"
          >
            <span aria-hidden="true">{requirements.hasUppercase ? "✓" : "✗"}</span>
            <span>Al menos 1 letra mayúscula</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
