import { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    InputAdornment,
    Button,
    Chip,
    Avatar,
    IconButton,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    Search,
    LocationOn,
    Work,
    AccessTime,
    BookmarkBorder,
    Bookmark,
    Business,
    AttachMoney,
} from "@mui/icons-material";
import { Navbar } from "../../components/layout/Navbar";
import { AnimatedBackground } from "../../components/background/AnimatedBackground";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobs, applyForJob, fetchUserApplications, resetApplicationStatus } from "../../store/slices/jobSlice";

const Jobs = () => {
    const dispatch = useDispatch();
    const { jobs, loading, error, userApplications, applicationStatus } = useSelector((state) => state.jobs);
    const { user } = useSelector((state) => state.auth);

    const [searchQuery, setSearchQuery] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [jobType, setJobType] = useState("all");
    const [savedJobs, setSavedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applyOpen, setApplyOpen] = useState(false);
    const [resumeUrl, setResumeUrl] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [fullName, setFullName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");

    // Initial Fetch
    useEffect(() => {
        dispatch(fetchJobs());
        if (user?.id) {
            dispatch(fetchUserApplications(user.id));
        }
    }, [dispatch, user?.id]);

    // Select first job when jobs are loaded
    useEffect(() => {
        if (jobs.length > 0 && !selectedJob) {
            setSelectedJob(jobs[0]);
        }
    }, [jobs, selectedJob]);

    // Update application status feedback
    useEffect(() => {
        if (applicationStatus === 'succeeded') {
            alert("Application submitted successfully!");
            setApplyOpen(false);
            setResumeUrl("");
            setCoverLetter("");
            dispatch(resetApplicationStatus());
        } else if (applicationStatus === 'failed') {
            alert(error || "Failed to submit application");
            dispatch(resetApplicationStatus());
        }
    }, [applicationStatus, error, dispatch]);

    const isJobApplied = (jobId) => {
        return userApplications?.some(app => app.jobId === jobId); // Backend response structure dependent
    };

    const toggleSaveJob = (jobId) => {
        setSavedJobs((prev) =>
            prev.includes(jobId)
                ? prev.filter((id) => id !== jobId)
                : [...prev, jobId]
        );
    };

    // Helper function to format salary
    const formatSalary = (job) => {
        if (job.salaryMin && job.salaryMax) {
            return `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k`;
        }
        return null;
    };

    // Helper function to parse skills
    const parseSkills = (skillsRequired) => {
        if (typeof skillsRequired === 'string') {
            try {
                return JSON.parse(skillsRequired);
            } catch {
                return [];
            }
        }
        return skillsRequired || [];
    };

    // Helper function to format posted time
    const formatPostedTime = (createdAt) => {
        const now = new Date();
        const posted = new Date(createdAt);
        const diffMs = now - posted;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return posted.toLocaleDateString();
    };



    const handleApply = () => {
        if (!user) {
            alert("Please login to apply");
            return;
        }

        const applicationData = {
            jobId: selectedJob.jobId,
            candidateId: user.id,
            resumeUrl,
            coverLetter
        };

        dispatch(applyForJob(applicationData));
    };

    const resetApplicationForm = () => {
        setResumeUrl("");
        setCoverLetter("");
    };

    const handleApplyClick = () => {
        setApplyOpen(true);
        resetApplicationForm();
    };

    const filteredJobs = jobs.filter((job) => {
        // Parse skills if it's a JSON string
        const skills = typeof job.skillsRequired === 'string'
            ? JSON.parse(job.skillsRequired)
            : job.skillsRequired || [];

        const matchesSearch =
            job.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            skills.some((skill) =>
                skill.toLowerCase().includes(searchQuery.toLowerCase())
            );
        const matchesLocation =
            !locationQuery ||
            job.location?.toLowerCase().includes(locationQuery.toLowerCase());
        const matchesType =
            jobType === "all" || (jobType === "remote" && job.isRemote);

        return matchesSearch && matchesLocation && matchesType;
    });

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <AnimatedBackground />
            <Navbar />

            <Box sx={{ position: "relative", zIndex: 1, pt: 12, pb: 8 }}>
                <Box sx={{ maxWidth: 1400, mx: "auto", px: 3 }}>
                    {/* Search Section */}
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        sx={{ mb: 4 }}
                    >
                        <Typography
                            variant="h3"
                            sx={{ mb: 1, fontWeight: 700, color: "text.primary" }}
                        >
                            Find Your Dream Job
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>
                            Discover opportunities from leading companies worldwide
                        </Typography>

                        <Card sx={{ p: 2 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    flexWrap: { xs: "wrap", md: "nowrap" },
                                }}
                            >
                                <TextField
                                    fullWidth
                                    placeholder="Job title, company, or skills..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ flex: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    placeholder="Location"
                                    value={locationQuery}
                                    onChange={(e) => setLocationQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOn />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ flex: 1 }}
                                />
                                <FormControl sx={{ minWidth: 150 }}>
                                    <InputLabel>Job Type</InputLabel>
                                    <Select
                                        value={jobType}
                                        label="Job Type"
                                        onChange={(e) => setJobType(e.target.value)}
                                    >
                                        <MenuItem value="all">All Jobs</MenuItem>
                                        <MenuItem value="remote">Remote</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ px: 4, whiteSpace: "nowrap" }}
                                >
                                    Search
                                </Button>
                            </Box>
                        </Card>
                    </Box>

                    {/* Error Message */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        /* Main Content */
                        <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
                            {/* Job Listings */}
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    {filteredJobs.length} Jobs Found
                                </Typography>
                                <Card>
                                    {filteredJobs.length === 0 ? (
                                        <Box sx={{ p: 4, textAlign: "center" }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No jobs found matching your criteria.
                                            </Typography>
                                        </Box>
                                    ) : (
                                        filteredJobs.map((job, index) => (
                                            <Box key={job.jobId || index}>
                                                {index > 0 && <Divider />}
                                                <Box
                                                    component={motion.div}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    onClick={() => setSelectedJob(job)}
                                                    sx={{
                                                        p: 2.5,
                                                        cursor: "pointer",
                                                        borderLeft: 4,
                                                        borderLeftColor:
                                                            selectedJob?.jobId === job.jobId
                                                                ? "primary.main"
                                                                : "transparent",
                                                        bgcolor:
                                                            selectedJob?.jobId === job.jobId
                                                                ? "action.hover"
                                                                : "transparent",
                                                        transition: "all 0.2s",
                                                        "&:hover": {
                                                            bgcolor: "action.hover",
                                                        },
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            mb: 1.5,
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
                                                            <Avatar
                                                                sx={{
                                                                    bgcolor: "primary.main",
                                                                    width: 48,
                                                                    height: 48,
                                                                }}
                                                                src={job.companyLogoUrl}
                                                            >
                                                                {!job.companyLogoUrl && (job.companyName?.[0] || "C")}
                                                            </Avatar>
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography
                                                                    variant="h6"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        mb: 0.5,
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                    }}
                                                                >
                                                                    {job.jobTitle}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{ color: "text.secondary", mb: 1 }}
                                                                >
                                                                    {job.companyName}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{ color: "text.secondary", fontSize: 13 }}
                                                                >
                                                                    <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                                                                    {job.location}
                                                                    {job.isRemote && " • Remote"}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            gap: 1,
                                                            flexWrap: "wrap",
                                                            mb: 1.5,
                                                        }}
                                                    >
                                                        {formatSalary(job) && (
                                                            <Chip
                                                                icon={<AttachMoney />}
                                                                label={formatSalary(job)}
                                                                size="small"
                                                                sx={{ fontSize: 12 }}
                                                            />
                                                        )}
                                                        {job.createdAt && (
                                                            <Chip
                                                                icon={<AccessTime />}
                                                                label={formatPostedTime(job.createdAt)}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ fontSize: 12 }}
                                                            />
                                                        )}
                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                                            {parseSkills(job.skillsRequired).slice(0, 3).map((skill) => (
                                                                <Chip
                                                                    key={skill}
                                                                    label={skill}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            ))}
                                                        </Box>
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleSaveJob(job.jobId);
                                                            }}
                                                        >
                                                            {savedJobs.includes(job.jobId) ? (
                                                                <Bookmark color="primary" />
                                                            ) : (
                                                                <BookmarkBorder />
                                                            )}
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                </Card>
                            </Box>

                            {/* Job Details */}
                            {selectedJob && (
                                <Box sx={{ flex: 1 }}>
                                    <Card sx={{ position: "sticky", top: 100 }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: "primary.main",
                                                        width: 64,
                                                        height: 64,
                                                        fontSize: 28,
                                                    }}
                                                    src={selectedJob.companyLogoUrl}
                                                >
                                                    {!selectedJob.companyLogoUrl && (selectedJob.companyName?.[0] || "C")}
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                        {selectedJob.jobTitle}
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ color: "text.secondary", mb: 1 }}>
                                                        {selectedJob.companyName}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                        <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                                                        {selectedJob.location}{" "}
                                                        {selectedJob.isRemote && "• Remote available"}
                                                    </Typography>
                                                </Box>
                                                <IconButton onClick={() => toggleSaveJob(selectedJob.jobId)}>
                                                    {savedJobs.includes(selectedJob.jobId) ? (
                                                        <Bookmark color="primary" />
                                                    ) : (
                                                        <BookmarkBorder />
                                                    )}
                                                </IconButton>
                                            </Box>

                                            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    size="large"
                                                    onClick={handleApplyClick}
                                                    disabled={isJobApplied(selectedJob.jobId)}
                                                >
                                                    {isJobApplied(selectedJob.jobId) ? "Applied" : "Apply Now"}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    size="large"
                                                    onClick={() => toggleSaveJob(selectedJob.jobId)}
                                                >
                                                    {savedJobs.includes(selectedJob.jobId) ? "Saved" : "Save Job"}
                                                </Button>
                                            </Box>

                                            <Divider sx={{ my: 3 }} />

                                            {/* Job Info Grid */}
                                            <Box
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(2, 1fr)",
                                                    gap: 2,
                                                    mb: 3,
                                                }}
                                            >
                                                {selectedJob.employmentType && (
                                                    <Box>
                                                        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                                            <Work sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                                Job Type
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                            {selectedJob.employmentType}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {formatSalary(selectedJob) && (
                                                    <Box>
                                                        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                                            <AttachMoney sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                                Salary
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                            {formatSalary(selectedJob)}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {selectedJob.experienceLevel && (
                                                    <Box>
                                                        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                                            <Business sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                                Experience Level
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                            {selectedJob.experienceLevel}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {selectedJob.status && (
                                                    <Box>
                                                        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                                            <Work sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                                Status
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                            {selectedJob.status}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>

                                            <Divider sx={{ my: 3 }} />

                                            {selectedJob.description && (
                                                <>
                                                    <Box sx={{ mb: 3 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                                            About the Role
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                                                            {selectedJob.description}
                                                        </Typography>
                                                    </Box>

                                                    <Divider sx={{ my: 3 }} />
                                                </>
                                            )}

                                            {selectedJob.requirements && (
                                                <>
                                                    <Box sx={{ mb: 3 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                                            Requirements
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                                                            {selectedJob.requirements}
                                                        </Typography>
                                                    </Box>

                                                    <Divider sx={{ my: 3 }} />
                                                </>
                                            )}

                                            {/* Responsibilities */}
                                            {selectedJob.responsibilities && (
                                                <>
                                                    <Box sx={{ mb: 3 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                                            Responsibilities
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                                                            {selectedJob.responsibilities}
                                                        </Typography>
                                                    </Box>

                                                    <Divider sx={{ my: 3 }} />
                                                </>
                                            )}

                                            {/* Skills */}
                                            {selectedJob.skillsRequired && parseSkills(selectedJob.skillsRequired).length > 0 && (
                                                <>
                                                    <Box sx={{ mb: 3 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                                            Skills Required
                                                        </Typography>
                                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                                            {parseSkills(selectedJob.skillsRequired).map((skill) => (
                                                                <Chip
                                                                    key={skill}
                                                                    label={skill}
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>

                                                    <Divider sx={{ my: 3 }} />
                                                </>
                                            )}

                                            {/* Posted Time */}
                                            {selectedJob.createdAt && (
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <AccessTime sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                        Posted {formatPostedTime(selectedJob.createdAt)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Application Dialog */}
                    <Dialog
                        open={applyOpen}
                        onClose={() => setApplyOpen(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>
                            Apply for {selectedJob?.jobTitle}
                        </DialogTitle>

                        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                            <TextField
                                label="Full Name"
                                fullWidth
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />

                            <TextField
                                label="Email"
                                fullWidth
                                value={user.email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <TextField
                                label="Resume URL"
                                fullWidth
                                value={resumeUrl}
                                onChange={(e) => setResumeUrl(e.target.value)}
                            />

                            <TextField
                                label="Cover Letter (Optional)"
                                multiline
                                rows={4}
                                fullWidth
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                placeholder="Tell us why you're a great fit for this role..."
                            />
                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={() => setApplyOpen(false)}>
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleApply}
                                disabled={applicationStatus === 'loading'}
                            >
                                {applicationStatus === 'loading' ? <CircularProgress size={24} /> : "Submit Application"}
                            </Button>
                        </DialogActions>
                    </Dialog>


                </Box>
            </Box>
        </Box >
    );
};

export default Jobs;