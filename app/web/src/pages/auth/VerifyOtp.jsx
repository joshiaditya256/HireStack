import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyOtp } from "../../store/slices/authSlice";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
} from "@mui/material";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  if (!email) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Alert severity="error">
          Email not found. Please sign up again.
        </Alert>
      </Box>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await dispatch(verifyOtp({ email, otp: otp.trim() })).unwrap();
      
      console.log("✅ OTP verified! User stored in Redux:", result);
      
      navigate("/profile-setup");
    } catch (err) {
      console.error("❌ OTP verification failed:", err);
      setError(err || "Invalid or expired OTP");
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
        bgcolor: "background.default",
      }}
    >
      <Paper sx={{ p: 4, width: 400, maxWidth: "90%" }}>
        <Typography variant="h5" sx={{ mb: 1, textAlign: "center" }}>
          Verify OTP
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
          Enter the 6-digit OTP sent to <b>{email}</b>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleVerify}>
          <TextField
            label="Enter OTP"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputProps={{
              maxLength: 6,
              style: { textAlign: "center", fontSize: "20px", letterSpacing: "4px" }
            }}
            sx={{ mb: 3 }}
            autoFocus
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default VerifyOtp;