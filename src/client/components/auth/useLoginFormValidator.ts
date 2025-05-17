import { useState } from 'react';
import { LoginFormState, LoginFormErrors } from './types'; // Assuming types will be defined here or moved from LoginForm

export const useLoginFormValidator = (isRegistering: boolean, formData: LoginFormState) => {
    const [formErrors, setFormErrors] = useState<LoginFormErrors>({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const validateForm = (): boolean => {
        let isValid = true;
        const errors: LoginFormErrors = {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        };

        if (isRegistering && !formData.username.trim()) {
            errors.username = 'Username is required';
            isValid = false;
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
            isValid = false;
        }

        if (!formData.password) {
            errors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (isRegistering && formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const clearFieldError = (name: keyof LoginFormErrors) => {
        if (formErrors[name]) {
            setFormErrors((prev: LoginFormErrors) => ({ ...prev, [name]: '' }));
        }
    };

    const resetFormErrors = () => {
        setFormErrors({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
    };

    return { formErrors, validateForm, clearFieldError, resetFormErrors };
}; 