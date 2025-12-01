import React from "react"
import { useForm, UseFormSetError } from "react-hook-form"
import toast from "react-hot-toast"
import { LoginFormData, LOGIN_VALIDATION_RULES } from "@/utils/login/login-validation-rules"
import { showLoginErrorToast } from "@/utils/login/login-field-error-toast"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { setAuthToken, setUserRole, setUserId } from "@/lib/auth"

const ROLE_ROUTES: Record<number, string> = {
  2: "/page/dean/dashboard",
  3: "/page/staff/dashboard",
  4: "/page/admin/dashboard",
};

interface ValidationErrors {
  message?: string;
  errors?: {
    username?: string[];
    password?: string[];
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface LoginResponse {
  token: string;
  user: User;
  role?: number;
  expires_at?: string;
}

const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  const toastFn = type === 'success' ? toast.success : toast.error;
  toastFn(message, { position: "top-center", duration: 4000 });
};

const handleValidationErrors = (
  validationErrors: ValidationErrors,
  setError: UseFormSetError<LoginFormData>,
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
  const [isSuccess, setIsSuccess] = React.useState(false);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    mode: "onTouched",
    defaultValues: { username: "", password: "" },
  });

  const { handleSubmit, watch, formState: { errors }, reset, setError, clearErrors } = form;
  const formData = watch();

  const onSubmit = async (data: LoginFormData) => {
    // Prevent submission if already successful
    if (isSuccess) return;
    
    setIsLoading(true);
    clearErrors();
    
    try {
      const response = await apiClient.post<LoginResponse, LoginFormData>(
        "/users/login",
        data
      );

      if (response.error) {
        if (response.status === 422 && response.data) {
          handleValidationErrors(response.data as unknown as ValidationErrors, setError, setIsLoading);
        } else {
          showToast(response.error);
          setIsLoading(false);
        }
        return;
      }

      // Store auth data with expiry
      if (response.data?.token && response.data?.expires_at) {
        setAuthToken(response.data.token, response.data.expires_at);
      }

      if (response.data?.role) {
        setUserRole(response.data.role);
      }

      if (response.data?.user?.id) {
        setUserId(response.data.user.id);
      }

      // Store user data in localStorage
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', JSON.stringify(response.data.role));
      }

      // Stop loading spinner but keep button disabled
      setIsLoading(false);
      setIsSuccess(true);
      
      showToast("Login successful!", 'success');
      
      const role = response.data?.role;
      const redirectPath = role ? ROLE_ROUTES[role] : ROLE_ROUTES[4];
      
      router.refresh();
      // router.replace(redirectPath);
      window.location.href = redirectPath;
      
      reset();
      setShowPassword(false);
      setRememberMe(false);
    } catch (error) {
      showToast("Login failed! Please try again.");
      setIsLoading(false);
      setIsSuccess(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent form submission if already successful
    if (isSuccess) return;
    
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
    isSuccess,
    handlePasswordToggle: () => setShowPassword(v => !v),
    handleRememberMeChange: (checked: boolean) => setRememberMe(checked),
    handleSubmit: handleFormSubmit,
    validationRules: LOGIN_VALIDATION_RULES
  };
};