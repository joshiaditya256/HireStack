import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, signupUser } from "../../store/slices/authSlice.js";
import { setUser } from "../../store/slices/authSlice";
import axiosInstance from "../../lib/axios.js";
import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Container,
  FormControlLabel,
  Switch,
} from "@mui/material";

// import { Google, GitHub } from "@mui/icons-material";
// import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);


  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      if (mode === "signup" && password !== confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (mode === "login") {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate("/");
    } else {
      await dispatch(signupUser({ name, email, password, role: isRecruiter ? "RECRUITER" : "CANDIDATE" })).unwrap();
      navigate("/auth/verify", { state: { email } });
    }
  };


  //   const handleGoogleSignIn = async () => {
  //     setError(null);
  //     // const { error } = await signInWithGoogle();
  //     if (error) setError(error.message);
  //   };

  //   const handleGitHubSignIn = async () => {
  //     setError(null);
  //     // const { error } = await signInWithGitHub();
  //     if (error) setError(error.message);
  //   };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError(null);
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
                {mode === "login" ? "Welcome back!" : "Create your account"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mode === "login"
                  ? "Sign in to continue"
                  : "Join our community today"}
              </Typography>
            </Box>

            <Box sx={{ p: 4 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>

                    {mode == "signup" && (<TextField
                      label="Name"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      sx={{ mb: 2 }}
                    />)}

                    <TextField
                      label="Email"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Password"
                      type="password"
                      fullWidth
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    {mode === "login" && (
                      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                        <Link to="/auth/forgot-password" style={{ textDecoration: "none", color: "#1976d2", fontSize: "0.875rem" }}>
                          Forgot Password?
                        </Link>
                      </Box>
                    )}

                    {mode === "signup" && (
                      <>
                        <TextField
                          label="Confirm Password"
                          type="password"
                          fullWidth
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                          sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isRecruiter}
                              onChange={(e) => setIsRecruiter(e.target.checked)}
                              color="secondary" // Distinct color for recruiter
                            />
                          }
                          label={
                            <Typography variant="body2" color="text.secondary">
                              I am a Recruiter
                            </Typography>
                          }
                          sx={{ mb: 2, display: 'block' }}
                        />
                      </>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      sx={{ py: 1.5 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : mode === "login" ? (
                        "Sign In"
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </Box>

                  <Typography align="center" sx={{ mt: 2 }}>
                    {mode === "login"
                      ? "Don't have an account?"
                      : "Already have an account?"}{" "}
                    <span
                      style={{ color: "#1976d2", cursor: "pointer" }}
                      onClick={toggleMode}
                    >
                      {mode === "login" ? "Sign up" : "Sign in"}
                    </span>
                  </Typography>
                </motion.div>
              </AnimatePresence>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Auth;
