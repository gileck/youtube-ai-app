import React from 'react';
import { useAuth } from '@/client/context/AuthContext';
import { LoginForm } from './LoginForm';
import { Box, CircularProgress, Modal, Paper, Typography } from '@mui/material';

interface AuthWrapperProps {
    children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return (
            <Modal open={true}>
                <Paper sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    p: 4
                }}>
                    <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                        Sign In
                    </Typography>
                    <LoginForm />
                </Paper>
            </Modal>
        );
    }

    return <>{children}</>;
};

export default AuthWrapper; 