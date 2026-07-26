import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import jobInstance from "../../lib/jobInstance";

// Fetch all jobs
export const fetchJobs = createAsyncThunk(
    "jobs/fetchJobs",
    async (_, { rejectWithValue }) => {
        try {
            const response = await jobInstance.get("/api/jobs");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.msg || "Failed to fetch jobs");
        }
    }
);

// Fetch applications for the current candidate
export const fetchUserApplications = createAsyncThunk(
    "jobs/fetchUserApplications",
    async (candidateId, { rejectWithValue }) => {
        try {
            const response = await jobInstance.get(`/api/applications/candidate/${candidateId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.msg || "Failed to fetch applications");
        }
    }
);

// Apply for a job
export const applyForJob = createAsyncThunk(
    "jobs/applyForJob",
    async (applicationData, { rejectWithValue }) => {
        try {
            const response = await jobInstance.post("/api/applications", applicationData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.msg || "Failed to apply for job");
        }
    }
);

const jobSlice = createSlice({
    name: "jobs",
    initialState: {
        jobs: [],
        userApplications: [], // List of applications made by the user
        loading: false,
        error: null,
        applicationStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    },
    reducers: {
        clearJobError(state) {
            state.error = null;
        },
        resetApplicationStatus(state) {
            state.applicationStatus = "idle";
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Jobs
            .addCase(fetchJobs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.jobs = action.payload;
            })
            .addCase(fetchJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch User Applications
            .addCase(fetchUserApplications.pending, (state) => {
                // We might not want global loading for this to avoid flickering
            })
            .addCase(fetchUserApplications.fulfilled, (state, action) => {
                state.userApplications = action.payload;
            })
            .addCase(fetchUserApplications.rejected, (state, action) => {
                console.error("Failed to fetch user applications:", action.payload);
            })

            // Apply for Job
            .addCase(applyForJob.pending, (state) => {
                state.applicationStatus = "loading";
                state.error = null;
            })
            .addCase(applyForJob.fulfilled, (state, action) => {
                state.applicationStatus = "succeeded";
                // Optimistically add to userApplications
                state.userApplications.push(action.payload);
            })
            .addCase(applyForJob.rejected, (state, action) => {
                state.applicationStatus = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearJobError, resetApplicationStatus } = jobSlice.actions;
export default jobSlice.reducer;
