// hooks/useLoginForm.ts
import React from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { LoginFormData, LOGIN_VALIDATION_RULES } from "@/utils/login/login-validation-rules"
import { showLoginErrorToast } from "@/utils/login/login-field-error-toast"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

const ROLE_ROUTES: Record<number, string> = {
  2: "/pages/faculty/dashboard",
  3: "/pages/staff/dashboard",
  4: "/pages/admin/dashboard",
};

const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  const toastFn = type === 'success' ? toast.success : toast.error;
  toastFn(message, { position: "top-center", duration: 4000 });
};

const handleValidationErrors = (
  validationErrors: any,
  setError: any,
  setIsLoading: (loading: boolean) => void
) => {
  const { username, password } = validationErrors.errors || {};
  
  if (username && !password) {
    setError('username', { type: 'manual', message: username[0] });
    showToast(username[0]);
  } else if (password && !username) {
    setError('password', { type: 'manual', message: password[0] });
    showToast(password[0]);
  } else if (username && password) {
    setError('username', { type: 'manual', message: username[0] });
    setError('password', { type: 'manual', message: password[0] });
    showToast('The provided credentials are incorrect.');
  }
  
  setIsLoading(false);
};

export const useLoginForm = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    mode: "onTouched",
    defaultValues: { username: "", password: "" },
  });

  const { handleSubmit, watch, formState: { errors }, reset, setError, clearErrors } = form;
  const formData = watch();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    clearErrors();
    
    try {
      const response = await apiClient.post<{ token: string; user: any; role?: number }, LoginFormData>(
        "/users/login",
        data
      );

      if (response.error) {
        if (response.status === 422 && response.data) {
          handleValidationErrors(response.data, setError, setIsLoading);
        } else {
          showToast(response.error);
          setIsLoading(false);
        }
        return;
      }

      // Store user data in localStorage for AuthContext
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', JSON.stringify(response.data.role));
      }

      showToast("Login successful!", 'success');
      
      const role = response.data?.role;
      const redirectPath = role ? ROLE_ROUTES[role] : ROLE_ROUTES[4];
      
      router.refresh();
      router.replace(redirectPath);
      
      reset();
      setShowPassword(false);
      setRememberMe(false);
    } catch (error) {
      showToast("Login failed! Please try again.");
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit, (errors) => {
      showLoginErrorToast(errors, formData);
    })();
  };

  return {
    form,
    formData,
    errors,
    showPassword,
    rememberMe,
    isLoading,
    handlePasswordToggle: () => setShowPassword(v => !v),
    handleRememberMeChange: (checked: boolean) => setRememberMe(checked),
    handleSubmit: handleFormSubmit,
    validationRules: LOGIN_VALIDATION_RULES
  };
};