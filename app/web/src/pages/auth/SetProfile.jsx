import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import profileInstance from "../../lib/profileInstance.js";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Step,
  Stepper,
  StepLabel,
  LinearProgress,
  Fade,
  Zoom,
  Card,
  InputAdornment,
} from "@mui/material";
import {
  PhotoCamera,
  School,
  Work,
  Code,
  LocationOn,
  Person,
  ArrowBack,
  ArrowForward,
  Check,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "../../store/slices/authSlice.js";
import { Autocomplete } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { searchLocations, searchSkills, searchCompanies, searchJobTitles, searchUniversities } from "../../lib/externalApis";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [imagePreview, setImagePreview] = useState("");

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const [form, setForm] = useState({
    userId: user?.id || "",
    headline: "",
    bio: "",
    skills: [],
    experience: [],
    education: [],
    location: "",
    avatarUrl: "",
  });

  // Autocomplete Options State
  const [locationOptions, setLocationOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [titleOptions, setTitleOptions] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);
  const [universityOptions, setUniversityOptions] = useState([]);

  // Search Handlers
  const handleLocationSearch = async (query) => {
    const results = await searchLocations(query);
    setLocationOptions(results);
  };

  const handleCompanySearch = async (query) => {
    const results = await searchCompanies(query);
    setCompanyOptions(results);
  };

  const handleTitleSearch = async (query) => {
    const results = await searchJobTitles(query);
    setTitleOptions(results);
  };

  const handleSkillSearch = async (query) => {
    const results = await searchSkills(query);
    setSkillOptions(results);
  };

  const handleUniversitySearch = async (query) => {
    const results = await searchUniversities(query);
    setUniversityOptions(results);
  };

  // Temporary input states for multi-item fields
  const [skillInput, setSkillInput] = useState("");
  const [expInput, setExpInput] = useState({
    title: "",
    company: "",
    duration: "",
  });
  const [eduInput, setEduInput] = useState({
    degree: "",
    school: "",
    year: "",
  });

  useEffect(() => {
    if (user?.id) {
      setForm((prev) => ({ ...prev, userId: user.id }));
    }
  }, [user]);

  useEffect(() => {
    if (form.avatarUrl) {
      setImagePreview(form.avatarUrl);
    }
  }, [form.avatarUrl]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setForm({
      ...form,
      skills: form.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const addExperience = () => {
    if (expInput.title.trim() && expInput.company.trim()) {
      setForm({
        ...form,
        experience: [
          ...form.experience,
          {
            title: expInput.title,
            company: expInput.company,
            duration: expInput.duration,
          },
        ],
      });
      setExpInput({ title: "", company: "", duration: "" });
    }
  };

  const removeExperience = (index) => {
    setForm({
      ...form,
      experience: form.experience.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    if (eduInput.degree.trim() && eduInput.school.trim()) {
      setForm({
        ...form,
        education: [
          ...form.education,
          {
            degree: eduInput.degree,
            school: eduInput.school,
            year: eduInput.year,
          },
        ],
      });
      setEduInput({ degree: "", school: "", year: "" });
    }
  };

  const removeEducation = (index) => {
    setForm({
      ...form,
      education: form.education.filter((_, i) => i !== index),
    });
  };

  const steps = [
    "Basic Info",
    "Professional Details",
    "Skills",
    "Experience",
    "Education",
  ];

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!form.headline.trim()) {
          setError("Please enter your professional headline");
          return false;
        }
        if (!form.bio.trim()) {
          setError("Please write a short bio about yourself");
          return false;
        }
        break;
      case 1:
        if (!form.location.trim()) {
          setError("Please enter your location");
          return false;
        }
        break;
      case 2:
        if (form.skills.length === 0) {
          setError("Please add at least one skill");
          return false;
        }
        break;
      case 3:
        if (form.experience.length === 0) {
          setError("Please add at least one work experience");
          return false;
        }
        break;
      case 4:
        if (form.education.length === 0) {
          setError("Please add at least one education entry");
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // Format data to match Spring Boot backend expectations
      const profileData = {
        userId: form.userId,
        headline: form.headline,
        bio: form.bio,
        skills: form.skills.join(", "), // Convert array to comma-separated string
        experience: JSON.stringify(form.experience), // Convert to JSON string
        education: JSON.stringify(form.education), // Convert to JSON string
        location: form.location,
        avatarUrl: form.avatarUrl || "",
      };

      console.log("Sending profile data:", profileData);

      const response = await profileInstance.post("/addprofile", profileData);

      console.log("Profile created:", response.data);
      setSuccess(true);

      // Fetch updated user data (including new profile) to store in Redux
      await dispatch(fetchCurrentUser());

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Profile creation error:", err);
      setError(
        err.response?.data?.msg ||
        err.response?.data?.message ||
        err.message ||
        "Failed to create profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkipForNow = () => {
    navigate("/");
  };

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Avatar
                    src={imagePreview || undefined}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      mb: 2,
                      border: "4px solid",
                      borderColor: "primary.main",
                      fontSize: "3rem",
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 16,
                      right: -8,
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                    size="small"
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                  Welcome, {user?.name}! 👋
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Let's set up your professional profile
                </Typography>
              </Box>

              <TextField
                name="avatarUrl"
                label="Profile Picture URL"
                placeholder="https://example.com/your-photo.jpg"
                fullWidth
                sx={{ mb: 3 }}
                value={form.avatarUrl}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhotoCamera color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                name="headline"
                label="Professional Headline *"
                placeholder="e.g., Full Stack Developer | React Enthusiast"
                fullWidth
                sx={{ mb: 3 }}
                value={form.headline}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                name="bio"
                label="About You *"
                placeholder="Tell us your story, what drives you, and what you're passionate about..."
                multiline
                rows={4}
                fullWidth
                sx={{ mb: 2 }}
                value={form.bio}
                onChange={handleChange}
                required
                helperText={`${form.bio.length}/500 characters`}
                inputProps={{ maxLength: 500 }}
              />
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Professional Details
              </Typography>

              <Autocomplete
                freeSolo
                options={locationOptions}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                onInputChange={(_, newInputValue) => handleLocationSearch(newInputValue)}
                onChange={(_, newValue) => setForm({ ...form, location: newValue || "" })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="location"
                    label="Location *"
                    placeholder="e.g., San Francisco, CA"
                    fullWidth
                    sx={{ mb: 3 }}
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Box
                sx={{
                  p: 3,
                  bgcolor: "background.default",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  💡 <strong>Pro tip:</strong> Adding your location helps
                  connect you with opportunities and professionals in your area.
                </Typography>
              </Box>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Your Skills
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add the skills that showcase your expertise
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={skillOptions}
                  onInputChange={(_, newInputValue) => handleSkillSearch(newInputValue)}
                  onChange={(_, newValue) => setForm({ ...form, skills: newValue })}
                  value={form.skills}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Skills"
                      placeholder="e.g., JavaScript, React"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <Code color="action" />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              {form.skills.length > 0 && (
                <Box
                  sx={{
                    p: 3,
                    bgcolor: "background.default",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                    {form.skills.map((skill, idx) => (
                      <Zoom in key={idx} style={{ transitionDelay: `${idx * 50}ms` }}>
                        <Chip
                          label={skill}
                          onDelete={() => removeSkill(skill)}
                          color="primary"
                          variant="outlined"
                        />
                      </Zoom>
                    ))}
                  </Stack>
                </Box>
              )}

              {form.skills.length === 0 && (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    color: "text.secondary",
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Code sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">
                    No skills added yet. Start adding your expertise!
                  </Typography>
                </Box>
              )}
            </Box>
          </Fade>
        );

      case 3:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Work Experience
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Share your professional journey
              </Typography>

              <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Autocomplete
                  freeSolo
                  options={titleOptions}
                  onInputChange={(_, newInputValue) => handleTitleSearch(newInputValue)}
                  onChange={(_, newValue) => setExpInput({ ...expInput, title: newValue || "" })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Job Title *"
                      placeholder="e.g., Senior Frontend Developer"
                      fullWidth
                      sx={{ mb: 2 }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Work color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                <Autocomplete
                  freeSolo
                  options={companyOptions}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                  onInputChange={(_, newInputValue) => handleCompanySearch(newInputValue)}
                  onChange={(_, newValue) => setExpInput({ ...expInput, company: typeof newValue === 'string' ? newValue : newValue?.name || "" })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Company *"
                      placeholder="e.g., Tech Corp Inc."
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <DatePicker
                    views={['year', 'month']}
                    label="Start Date"
                    value={expInput.startDate}
                    onChange={(newValue) => setExpInput({ ...expInput, startDate: newValue })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  <DatePicker
                    views={['year', 'month']}
                    label="End Date"
                    value={expInput.endDate}
                    onChange={(newValue) => setExpInput({ ...expInput, endDate: newValue })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>

                <Button
                  variant="contained"
                  onClick={() => {
                    if (expInput.title.trim() && expInput.company.trim()) {
                      const start = expInput.startDate ? format(expInput.startDate, "MM/yyyy") : "";
                      const end = expInput.endDate ? format(expInput.endDate, "MM/yyyy") : "Present";
                      const duration = start && end ? `${start} - ${end}` : "";
                      setForm({
                        ...form,
                        experience: [
                          ...form.experience,
                          {
                            title: expInput.title,
                            company: expInput.company,
                            duration: duration, // maintaining schema compatibility
                          },
                        ],
                      });
                      setExpInput({ title: "", company: "", startDate: null, endDate: null });
                    }
                  }}
                  fullWidth
                  disabled={!expInput.title.trim() || !expInput.company.trim()}
                >
                  Add Experience
                </Button>
              </Card>

              {form.experience.length > 0 && (
                <Stack spacing={2}>
                  {form.experience.map((exp, idx) => (
                    <Zoom in key={idx} style={{ transitionDelay: `${idx * 100}ms` }}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {exp.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {exp.company}
                            </Typography>
                            {exp.duration && (
                              <Typography variant="caption" color="text.secondary">
                                {exp.duration}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeExperience(idx)}
                            color="error"
                          >
                            ✕
                          </IconButton>
                        </Box>
                      </Card>
                    </Zoom>
                  ))}
                </Stack>
              )}

              {form.experience.length === 0 && (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    color: "text.secondary",
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Work sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">
                    No experience added yet. Add your first role!
                  </Typography>
                </Box>
              )}
            </Box>
          </Fade>
        );

      case 4:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Education
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tell us about your academic background
              </Typography>

              <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
                <TextField
                  label="Degree *"
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={eduInput.degree}
                  onChange={(e) =>
                    setEduInput({ ...eduInput, degree: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <School color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Autocomplete
                  freeSolo
                  options={universityOptions}
                  onInputChange={(_, newInputValue) => handleUniversitySearch(newInputValue)}
                  onChange={(_, newValue) => setEduInput({ ...eduInput, school: newValue || "" })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="School/University *"
                      placeholder="e.g., MIT"
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                  )}
                />

                <DatePicker
                  views={['year']}
                  label="Class Year"
                  value={eduInput.yearDate}
                  onChange={(newValue) => setEduInput({ ...eduInput, yearDate: newValue })}
                  slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
                />

                <Button
                  variant="contained"
                  onClick={() => {
                    if (eduInput.degree.trim() && eduInput.school.trim()) {
                      const yearStr = eduInput.yearDate ? format(eduInput.yearDate, "yyyy") : "";
                      setForm({
                        ...form,
                        education: [
                          ...form.education,
                          {
                            degree: eduInput.degree,
                            school: eduInput.school,
                            year: yearStr,
                          },
                        ],
                      });
                      setEduInput({ degree: "", school: "", yearDate: null });
                    }
                  }}
                  fullWidth
                  disabled={!eduInput.degree.trim() || !eduInput.school.trim()}
                >
                  Add Education
                </Button>
              </Card>

              {form.education.length > 0 && (
                <Stack spacing={2}>
                  {form.education.map((edu, idx) => (
                    <Zoom in key={idx} style={{ transitionDelay: `${idx * 100}ms` }}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {edu.degree}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {edu.school}
                            </Typography>
                            {edu.year && (
                              <Typography variant="caption" color="text.secondary">
                                Class of {edu.year}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeEducation(idx)}
                            color="error"
                          >
                            ✕
                          </IconButton>
                        </Box>
                      </Card>
                    </Zoom>
                  ))}
                </Stack>
              )}

              {form.education.length === 0 && (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    color: "text.secondary",
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <School sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">
                    No education added yet. Add your academic background!
                  </Typography>
                </Box>
              )}
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
        py: 4,
        // background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          width: 700,
          maxWidth: "95%",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={((activeStep + 1) / steps.length) * 100}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
          }}
        />

        {/* Stepper */}
        <Box sx={{ mt: 2, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      "&.Mui-completed": {
                        color: "success.main",
                      },
                    },
                  }}
                >
                  <Typography variant="caption">{label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {renderStepContent()}
        </LocalizationProvider>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          {/* ... Buttons ... */}
          {activeStep === 0 && (
            <Button color="inherit" onClick={handleSkipForNow}>
              Skip for now
            </Button>
          )}
          {activeStep > 0 && (
            <Button disabled={loading} onClick={handleBack} variant="outlined" startIcon={<ArrowBack />}>
              Back
            </Button>
          )}

          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
            endIcon={loading ? <CircularProgress size={20} /> : activeStep === steps.length - 1 ? <Check /> : <ArrowForward />}
          >
            {activeStep === steps.length - 1 ? "Complete Setup" : "Next"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileSetup;
