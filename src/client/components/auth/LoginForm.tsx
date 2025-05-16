import React, { useState } from 'react';
import { useAuth } from '@/client/context/AuthContext';
import {
    Box,
    Button,
    CircularProgress,
    TextField,
    Alert,
    Link
} from '@mui/material';

const LoginForm: React.FC = () => {
    const { login, register, isLoading, error } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear field error when user types
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;
        const errors = { ...formErrors };

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (isRegistering) {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
        } else {
            await login({
                email: formData.email,
                password: formData.password
            });
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setFormErrors({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isRegistering && (
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    error={!!formErrors.username}
                    helperText={formErrors.username}
                    disabled={isLoading}
                />
            )}

            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={isLoading}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                disabled={isLoading}
            />

            {isRegistering && (
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!formErrors.confirmPassword}
                    helperText={formErrors.confirmPassword}
                    disabled={isLoading}
                />
            )}

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
            >
                {isLoading ? (
                    <CircularProgress size={24} />
                ) : isRegistering ? (
                    'Register'
                ) : (
                    'Sign In'
                )}
            </Button>

            <Box textAlign="center">
                <Link
                    component="button"
                    variant="body2"
                    onClick={toggleMode}
                    type="button"
                    disabled={isLoading}
                >
                    {isRegistering
                        ? 'Already have an account? Sign in'
                        : "Don't have an account? Register"}
                </Link>
            </Box>
        </Box>
    );
};

export default LoginForm; 