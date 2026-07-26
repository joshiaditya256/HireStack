import { useState } from "react";
import { Link } from "react-router-dom";
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
import { ArrowBack } from "@mui/icons-material";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            // Endpoint confirmed: /forgot-password
            const response = await axiosInstance.post("/auth/forgot-password", { email });
            setMessage(response.data.msg || "Reset link sent to your email.");
        } catch (err) {
            console.error("Forgot password error:", err);
            setError(
                err.response?.data?.msg || "Failed to send reset link. Please try again."
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
                                Forgot Password?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Enter your email to receive a reset link
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

                            <Box component="form" onSubmit={handleSubmit}>
                                <TextField
                                    label="Email Address"
                                    type="email"
                                    fullWidth
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    sx={{ mb: 3 }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={loading}
                                    sx={{ py: 1.5, mb: 2 }}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>

                                <Button
                                    component={Link}
                                    to="/auth"
                                    startIcon={<ArrowBack />}
                                    fullWidth
                                    sx={{ textTransform: "none" }}
                                >
                                    Back to Sign In
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default ForgotPassword;
