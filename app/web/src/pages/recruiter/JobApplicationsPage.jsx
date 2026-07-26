import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    List,
    ListItem,
    Divider,
    Avatar,
    Button,
    Chip,
    Stack,
    CircularProgress,
    IconButton
} from '@mui/material';
import { ArrowBack, Description, Email, Person, Download } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import jobInstance from '../../lib/jobInstance';
import { Navbar } from '../../components/layout/Navbar';
import { format } from 'date-fns';

const JobApplicationsPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobTitle, setJobTitle] = useState("");

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await jobInstance.get(`/api/jobs/${jobId}/applications`);
                setApplications(response.data);
                if (response.data.length > 0) {
                    setJobTitle(response.data[0].jobTitle);
                } else {
                    // If no applications, fetch job details just to get the title
                    try {
                        const jobRes = await jobInstance.get(`/api/jobs/${jobId}`);
                        setJobTitle(jobRes.data.jobTitle);
                    } catch (e) {
                        console.error("Failed to fetch job details", e);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch applications", error);
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchApplications();
        }
    }, [jobId]);

    const handleDownloadResume = (url) => {
        window.open(url, '_blank');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 4, pt: 12 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/recruiter/dashboard')}
                    sx={{ mb: 3 }}
                >
                    Back to Dashboard
                </Button>

                <Paper sx={{ p: 4, borderRadius: 2 }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Applications
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            {jobTitle ? `For ${jobTitle}` : 'Loading...'}
                        </Typography>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : applications.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <Person sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                            <Typography variant="body1" color="text.secondary">
                                No applications yet for this job.
                            </Typography>
                        </Box>
                    ) : (
                        <List>
                            {applications.map((app, index) => (
                                <React.Fragment key={app.applicationId}>
                                    <ListItem
                                        alignItems="flex-start"
                                        sx={{
                                            px: 0,
                                            py: 3,
                                            flexDirection: { xs: 'column', md: 'row' },
                                            gap: 2
                                        }}
                                    >
                                        <Avatar
                                            sx={{ width: 60, height: 60, bgcolor: 'primary.main', fontSize: '1.5rem' }}
                                        >
                                            {app.candidateName ? app.candidateName.charAt(0).toUpperCase() : '?'}
                                        </Avatar>

                                        <Box sx={{ flex: 1, width: '100%' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {app.candidateName || "Unknown Candidate"}
                                                </Typography>
                                                <Chip
                                                    label={app.status || 'PENDING'}
                                                    size="small"
                                                    color={app.status === 'ACCEPTED' ? 'success' : app.status === 'REJECTED' ? 'error' : 'default'}
                                                />
                                            </Box>

                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, color: 'text.secondary' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Email fontSize="small" />
                                                    <Typography variant="body2">{app.candidateEmail || "No Email"}</Typography>
                                                </Box>
                                                <Typography variant="body2">•</Typography>
                                                <Typography variant="body2">
                                                    Applied on {app.appliedAt ? format(new Date(app.appliedAt), "MMM dd, yyyy") : "N/A"}
                                                </Typography>
                                            </Stack>

                                            {app.coverLetter && (
                                                <Box sx={{ mb: 2, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                                                    <Typography variant="subtitle2" gutterBottom>Cover Letter:</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {app.coverLetter}
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                {app.resumeUrl && (
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<Download />}
                                                        size="small"
                                                        onClick={() => handleDownloadResume(app.resumeUrl)}
                                                    >
                                                        Download Resume
                                                    </Button>
                                                )}
                                                {/* Future actions: Accept/Reject buttons */}
                                            </Box>
                                        </Box>
                                    </ListItem>
                                    {index < applications.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default JobApplicationsPage;
