"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/shared/Auth/LoginForm/LoginForm";
import { LoginFormValues } from "@/validators/shared/loginValidators";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { loginAsync, clearError } from "@/store/slices/authSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleLogin = async (data: LoginFormValues) => {
    try {
      console.log("handleLogin - data recibida:", data);
      // Mapear email a username para la API
      const loginData = {
        username: data.email, // La API espera username pero es el email
        password: data.password,
      };
      console.log("handleLogin - loginData enviada:", loginData);
      
      await dispatch(loginAsync(loginData)).unwrap();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="flex items-center flex-col justify-center">
      <LoginForm 
        onSubmit={handleLogin} 
        loading={loading}
        error={error}
      />
    </div>
  );
}
