import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axiosInstance from "../../lib/axios";
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    Container,
} from "@mui/material";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token.");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            // Endpoint confirmed: /reset-password
            await axiosInstance.post("/auth/reset-password", { token, newPassword: password });
            setMessage("Password reset successful! Redirecting to login...");
            setTimeout(() => {
                navigate("/auth");
            }, 3000);
        } catch (err) {
            console.error("Reset password error:", err);
            setError(
                err.response?.data?.msg || "Failed to reset password. Token may be expired."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "linear-gradient(180deg, hsl(40, 40%, 99%) 0%, hsl(40, 33%, 96%) 100%)",
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            overflow: "hidden",
                            boxShadow: "0 4px 24px hsla(0, 0%, 0%, 0.08)",
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                background:
                                    "linear-gradient(135deg, hsla(150, 25%, 45%, 0.15), hsla(350, 30%, 85%, 0.2))",
                                py: 5,
                                px: 4,
                                textAlign: "center",
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
                                Reset Password
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Enter your new password below
                            </Typography>
                        </Box>

                        <Box sx={{ p: 4 }}>
                            {message && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    {message}
                                </Alert>
                            )}
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {token && !message && (
                                <Box component="form" onSubmit={handleSubmit}>
                                    <TextField
                                        label="New Password"
                                        type="password"
                                        fullWidth
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        label="Confirm New Password"
                                        type="password"
                                        fullWidth
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        sx={{ mb: 3 }}
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        disabled={loading}
                                        sx={{ py: 1.5 }}
                                    >
                                        {loading ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </Button>
                                </Box>
                            )}

                            {!token && (
                                <Button
                                    component={Link}
                                    to="/auth"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                >
                                    Back to Login
                                </Button>
                            )}
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default ResetPassword;
