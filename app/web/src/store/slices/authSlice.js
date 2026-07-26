import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axios";

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      return { user: response.data.user, userProfile: response.data.userProfile };
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'Login failed');
    }
  }
);
export const signupUser = createAsyncThunk(
  "auth/signup",
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/signup", { name, email, password, role });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.msg || "Signup failed"
      );
    }
  }
);
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
      return res.data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.msg || "OTP verification failed"
      );
    }
  }
);
export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/resend-otp", { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.msg || "Failed to resend OTP"
      );
    }
  }
);
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/current-user");
      return { user: response.data.user, userProfile: response.data.userProfile };
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch user");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/auth/logout");
      return;
    } catch (error) {
      console.error(error);
      // return rejectWithValue(error.response?.data?.msg || "Logout failed");
    }
  }
);

const savedUser = JSON.parse(sessionStorage.getItem("user"));
const savedUserProfile = JSON.parse(sessionStorage.getItem("userProfile"));
// const savedAuth = JSON.parse(sessionStorage.getItem("isAuthenticated"));


const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: savedUser || null,
    userProfile: savedUserProfile || null,
    isAuthenticated: !!savedUser, // Derive from user presence
    isInitialized: !!savedUser, // Check if auth check has finished or user is available
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.userProfile = null; // Clear profile on logout
      state.isAuthenticated = false;
      state.isInitialized = true;
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userProfile");
      sessionStorage.removeItem("isAuthenticated");
    },
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setUserProfile(state, action) {
      state.userProfile = action.payload;
      sessionStorage.setItem("userProfile", JSON.stringify(action.payload));
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.userProfile = action.payload.userProfile;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;

        sessionStorage.setItem("user", JSON.stringify(action.payload.user));
        sessionStorage.setItem("userProfile", JSON.stringify(action.payload.userProfile));
        sessionStorage.setItem("isAuthenticated", true);

      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })


      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Current User
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.userProfile = action.payload.userProfile;
        state.isAuthenticated = true;
        state.isInitialized = true;
        sessionStorage.setItem("user", JSON.stringify(action.payload.user));
        sessionStorage.setItem("userProfile", JSON.stringify(action.payload.userProfile));
        sessionStorage.setItem("isAuthenticated", true);
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.user = null;
        sessionStorage.clear();
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.userProfile = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        sessionStorage.clear();
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.userProfile = null; // Clear profile on logout
        state.isAuthenticated = false;
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userProfile");
        sessionStorage.removeItem("isAuthenticated");
      });
  },
});

export const { logout, setUser, setUserProfile, clearError } = authSlice.actions;
export default authSlice.reducer;
