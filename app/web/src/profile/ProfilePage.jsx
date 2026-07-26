import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Box, Card, CardContent, Typography, Button, Avatar, IconButton,
    Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Divider, List, ListItem, ListItemText, ListItemSecondaryAction, Autocomplete, CircularProgress
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import {
    Edit, Add, CameraAlt, LocationOn, Business, Link as LinkIcon,
    Email, Phone, School, Work, OpenInNew, Delete
} from "@mui/icons-material";
import {
    updateBio, updateSkills, updateExperience,
    updateEducation, updateHeadline, getProfileByUserId, updateLocation,
    updateAvatar, updateBanner
} from "../apis/profileApi.js";
import { uploadImage } from "../apis/uploadApi.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { searchUniversities, searchCompanies, searchLocations, searchJobTitles, searchSkills } from "../lib/externalApis";
import { fetchUserPosts } from "../store/slices/feedSlice";
import PostCard from "../components/feed/PostCard";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../store/slices/authSlice";
import { getUserById } from "../apis/userApi.js";


const ProfilePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, userProfile } = useSelector((state) => state.auth);
    const { userPosts, loading: postsLoading } = useSelector((state) => state.feed);

    // State management
    const [fetchedData, setFetchedData] = useState(null);
    const [experiences, setExperiences] = useState([]);
    const [education, setEducation] = useState([]);
    const [skills, setSkills] = useState([]);

    // Always show logged-in user's profile
    const activeProfileId = user?.id;
    const isOwner = true; // Always viewing own profile

    // UI state
    const [profile, setProfile] = useState({
        name: user?.name || "User",
        headline: userProfile?.headline || "Software Engineer | React Developer",
        location: userProfile?.location || "New York, USA",
        about: userProfile?.bio || "Passionate developer...",
        website: userProfile?.website || "github.com",
        company: "Tech Corp",
        email: user?.email || "user@example.com",
        phone: userProfile?.phone || "+1 234 567 890",
        avatarUrl: userProfile?.avatarUrl || "",
        bannerUrl: userProfile?.bannerUrl || ""
    });

    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [editAboutOpen, setEditAboutOpen] = useState(false);
    const [addExperienceOpen, setAddExperienceOpen] = useState(false);
    const [addEducationOpen, setAddEducationOpen] = useState(false);
    const [addSkillOpen, setAddSkillOpen] = useState(false);

    // Form states
    const [editedProfile, setEditedProfile] = useState({});
    const [editedAbout, setEditedAbout] = useState("");

    // Use Date objects for Pickers internally, convert to string on save
    const [newExperience, setNewExperience] = useState({
        title: "", company: "", location: "", startDate: null, endDate: null, description: ""
    });
    const [newEducation, setNewEducation] = useState({
        school: "", degree: "", field: "", startDate: null, endDate: null
    });
    const [newSkill, setNewSkill] = useState("");

    // Autocomplete States
    const [companyOptions, setCompanyOptions] = useState([]);
    const [companyLoading, setCompanyLoading] = useState(false);
    const [schoolOptions, setSchoolOptions] = useState([]);
    const [schoolLoading, setSchoolLoading] = useState(false);
    const [locationOptions, setLocationOptions] = useState([]);
    const [locationLoading, setLocationLoading] = useState(false);

    // Helpers
    const fetchLocations = useMemo(() => {
        return async (query) => {
            if (!query || query.length < 3) return;
            setLocationLoading(true);
            const results = await searchLocations(query);
            setLocationOptions(results);
            setLocationLoading(false);
        };
    }, []);

    const fetchCompanies = useMemo(() => {
        return async (query) => {
            if (!query) return;
            setCompanyLoading(true);
            const results = await searchCompanies(query);
            setCompanyOptions(results);
            setCompanyLoading(false);
        };
    }, []);

    // Debounce Effects
    useEffect(() => {
        const handler = setTimeout(() => {
            if (newExperience.company && typeof newExperience.company === 'string' && newExperience.company.length > 2) {
                fetchCompanies(newExperience.company);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [newExperience.company, fetchCompanies]);

    useEffect(() => {
        const handler = setTimeout(() => {
            // Profile Edit Location
            if (editedProfile.location && editedProfile.location.length > 2) {
                fetchLocations(editedProfile.location);
            }
            // Experience Location
            if (newExperience.location && newExperience.location.length > 2) {
                fetchLocations(newExperience.location);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [editedProfile.location, newExperience.location, fetchLocations]);


    useEffect(() => {
        const handler = setTimeout(() => {
            const query = newEducation.school;
            if (query && typeof query === 'string' && query.length > 2) {
                const search = async () => {
                    setSchoolLoading(true);
                    const results = await searchUniversities(query);
                    setSchoolOptions(results);
                    setSchoolLoading(false);
                };
                search();
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [newEducation.school]);



    // Job Title Autocomplete
    const [titleOptions, setTitleOptions] = useState([]);
    const [titleLoading, setTitleLoading] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            const query = newExperience.title;
            if (query && typeof query === 'string' && query.length > 1) {
                const search = async () => {
                    setTitleLoading(true);
                    const results = await searchJobTitles(query);
                    setTitleOptions(results);
                    setTitleLoading(false);
                };
                search();
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [newExperience.title]);

    // Skill Autocomplete
    const [skillOptions, setSkillOptions] = useState([]);
    const [skillLoading, setSkillLoading] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (newSkill && typeof newSkill === 'string' && newSkill.length > 1) {
                const search = async () => {
                    setSkillLoading(true);
                    const results = await searchSkills(newSkill);
                    setSkillOptions(results);
                    setSkillLoading(false);
                };
                search();
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [newSkill]);




    // Fetch Profile Data
    useEffect(() => {
        if (!user) {
            navigate("/auth");
            return;
        }

        const loadProfile = async () => {
            try {
                if (!activeProfileId) return;

                const [profileRes, userRes] = await Promise.all([
                    getProfileByUserId(activeProfileId),
                    getUserById(activeProfileId)
                ]);

                const data = profileRes.data;
                const userData = userRes.data;

                console.log("📊 Profile Data Received:", data);
                console.log("👤 User Data Received:", userData);

                setFetchedData(data);

                // Parse complex fields
                let exp = [], edu = [], sk = [];
                try {
                    exp = data.experience ? JSON.parse(data.experience) : [];
                    console.log("✅ Parsed Experience:", exp);
                } catch (e) {
                    console.error("❌ Parse exp error:", e);
                    console.error("Raw experience data:", data.experience);
                }
                try {
                    edu = data.education ? JSON.parse(data.education) : [];
                    console.log("✅ Parsed Education:", edu);
                } catch (e) {
                    console.error("❌ Parse edu error:", e);
                    console.error("Raw education data:", data.education);
                }
                try {
                    sk = data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
                    console.log("✅ Parsed Skills:", sk);
                } catch (e) {
                    console.error("❌ Parse skills error:", e);
                }

                console.log("🔄 Setting state - Experiences count:", exp.length, "Education count:", edu.length, "Skills count:", sk.length);
                setExperiences(exp);
                setEducation(edu);
                setSkills(sk);
                console.log("✅ State updated successfully");

                const currentExp = exp.find(e => e.duration?.toLowerCase().includes("present")) || exp[0];

                setProfile({
                    name: userData.name || "User",
                    headline: data.headline || "",
                    location: data.location || "Location not set",
                    about: data.bio || "No bio available",
                    avatarUrl: data.avatarUrl || "",
                    bannerUrl: data.bannerUrl || "",
                    company: currentExp?.company || "",
                    website: data.website || "", // Ensure these are cleared if not present
                    email: userData.email || "", // Correctly set email from userData
                    phone: data.phone || ""      // Ensure phone is cleared if not present
                });

            } catch (err) {
                console.error("❌ Failed to fetch profile data:", err);
                console.error("Error details:", err.response || err.message);
            }
        };

        loadProfile();
    }, [user, navigate, activeProfileId]);

    // Fetch User Posts
    useEffect(() => {
        if (activeProfileId) {
            dispatch(fetchUserPosts({ userId: activeProfileId }));
        }
    }, [dispatch, activeProfileId]);


    // Handlers
    const handleSaveProfile = async () => {
        if (!activeProfileId || !fetchedData?.id) return;
        try {
            if (editedProfile.headline !== profile.headline) {
                await updateHeadline(fetchedData.id, { headline: editedProfile.headline });
            }
            if (editedProfile.location !== profile.location) {
                await updateLocation(fetchedData.id, { location: editedProfile.location });
            }
            setProfile(prev => ({ ...prev, ...editedProfile }));
            setEditProfileOpen(false);

            if (activeProfileId === user?.id) {
                dispatch(setUserProfile({
                    ...userProfile,
                    headline: editedProfile.headline,
                    location: editedProfile.location,
                    website: editedProfile.website
                }));
            }
        } catch (err) { console.error(err); }
    };

    const handleSaveAbout = async () => {
        if (!activeProfileId || !fetchedData?.id) return;
        try {
            await updateBio(fetchedData.id, { bio: editedAbout });
            setProfile({ ...profile, about: editedAbout });
            setEditAboutOpen(false);

            if (activeProfileId === user?.id) {
                dispatch(setUserProfile({ ...userProfile, bio: editedAbout }));
            }
        } catch (err) { console.error(err); }
    };

    const formatDate = (date) => {
        if (!date) return "";
        try { return format(date, "MM/yyyy"); } // Storing as readable string for now based on existing UI
        catch (e) { return ""; }
    };

    const handleAddExperience = async () => {
        if (!activeProfileId || !fetchedData?.id) return;
        const companyName = typeof newExperience.company === 'string' ? newExperience.company : newExperience.company?.name || "";

        const newItem = {
            ...newExperience,
            company: companyName,
            startDate: formatDate(newExperience.startDate),
            endDate: formatDate(newExperience.endDate),
            id: Date.now().toString()
        };
        const updatedExp = [newItem, ...experiences];
        try {
            await updateExperience(fetchedData.id, { experience: JSON.stringify(updatedExp) });
            setExperiences(updatedExp);
            setAddExperienceOpen(false);
            setNewExperience({ title: "", company: "", location: "", startDate: null, endDate: null, description: "" });

            if (activeProfileId === user?.id) {
                dispatch(setUserProfile({ ...userProfile, experience: JSON.stringify(updatedExp) }));
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteExperience = async (id) => {
        if (!activeProfileId || !fetchedData?.id) return;
        const updatedExp = experiences.filter(e => e.id !== id);
        try {
            await updateExperience(fetchedData.id, { experience: JSON.stringify(updatedExp) });
            setExperiences(updatedExp);

            // Sync with Redux store for Sidebar
            if (activeProfileId === user?.id) {
                dispatch(setUserProfile({ ...userProfile, experience: JSON.stringify(updatedExp) }));
            }
        } catch (err) { console.error(err); }
    };

    const handleAddEducation = async () => {
        if (!activeProfileId || !fetchedData?.id) return;
        const schoolName = typeof newEducation.school === 'string' ? newEducation.school : newEducation.school || "";

        const newItem = {
            ...newEducation,
            school: schoolName,
            startDate: formatDate(newEducation.startDate),
            endDate: formatDate(newEducation.endDate),
            id: Date.now().toString()
        };
        const updatedEdu = [newItem, ...education];
        try {
            await updateEducation(fetchedData.id, { education: JSON.stringify(updatedEdu) });
            setEducation(updatedEdu);
            setAddEducationOpen(false);
            setNewEducation({ school: "", degree: "", field: "", startDate: null, endDate: null });

            if (activeProfileId === user?.id) {
                dispatch(setUserProfile({ ...userProfile, education: JSON.stringify(updatedEdu) }));
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteEducation = async (id) => {
        if (!activeProfileId || !fetchedData?.id) return;
        const updatedEdu = education.filter(e => e.id !== id);
        try {
            await updateEducation(fetchedData.id, { education: JSON.stringify(updatedEdu) });
            setEducation(updatedEdu);

            if (activeProfileId === user?.id) {
                dispatch(setUserProfile({ ...userProfile, education: JSON.stringify(updatedEdu) }));
            }
        } catch (err) { console.error(err); }
    };

    const handleAddSkill = async () => {
        if (!newSkill || !activeProfileId || !fetchedData?.id) return;
        if (!skills.includes(newSkill)) {
            const updatedSkills = [...skills, newSkill];
            try {
                await updateSkills(fetchedData.id, { skills: updatedSkills.join(",") });
                setSkills(updatedSkills);
                setNewSkill("");
                setAddSkillOpen(false);

                if (activeProfileId === user?.id) {
                    dispatch(setUserProfile({ ...userProfile, skills: updatedSkills.join(",") }));
                }
            } catch (err) { console.error(err); }
        }
    };

    const handleDeleteSkill = async (skillToDelete) => {
        if (!activeProfileId || !fetchedData?.id) return;
        const updatedSkills = skills.filter(s => s !== skillToDelete);
        try {
            await updateSkills(fetchedData.id, { skills: updatedSkills.join(",") });
            setSkills(updatedSkills);

            if (activeProfileId === user?.id) {
                dispatch(setUserProfile({ ...userProfile, skills: updatedSkills.join(",") }));
            }
        } catch (err) { console.error(err); }
    };

    const handleImageUpload = async (e, type) => {
        if (!activeProfileId || !fetchedData?.id || !e.target.files[0]) return;
        const file = e.target.files[0];

        try {
            // 1. Upload to Cloudinary
            const imageUrl = await uploadImage(file);

            // 2. Update Backend
            if (type === 'avatar') {
                await updateAvatar(fetchedData.id, { avatarUrl: imageUrl });
                setProfile(prev => ({ ...prev, avatarUrl: imageUrl }));
                if (activeProfileId === user?.id) {
                    dispatch(setUserProfile({ ...userProfile, avatarUrl: imageUrl }));
                }
            } else if (type === 'banner') {
                await updateBanner(fetchedData.id, { bannerUrl: imageUrl });
                setProfile(prev => ({ ...prev, bannerUrl: imageUrl }));
                if (activeProfileId === user?.id) {
                    dispatch(setUserProfile({ ...userProfile, bannerUrl: imageUrl }));
                }
            }
        } catch (err) {
            console.error(`Failed to upload ${type}`, err);
            // Optionally show error snackbar here
        }
    };


    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
                <Navbar />
                <Box component="main" sx={{ py: 4, px: 2 }}>
                    <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }} sx={{ maxWidth: 1000, mx: "auto" }}>

                        {/* Profile Card */}
                        <Card sx={{ mb: 4, overflow: "visible" }}>
                            {/* Wrapper for Avatar and Cover */}
                            <Box sx={{
                                height: 200,
                                background: profile.bannerUrl ? `url(${profile.bannerUrl}) center/cover no-repeat` : "linear-gradient(135deg, hsla(150, 25%, 45%, 0.3), hsla(350, 30%, 85%, 0.4), hsla(25, 30%, 75%, 0.4))",
                                borderRadius: "16px 16px 0 0",
                                position: "relative"
                            }}>
                                {isOwner && (
                                    <>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="banner-upload"
                                            type="file"
                                            onChange={(e) => handleImageUpload(e, 'banner')}
                                        />
                                        <label htmlFor="banner-upload">
                                            <IconButton component="span" sx={{ position: "absolute", right: 16, top: 16, bgcolor: "rgba(255,255,255,0.8)" }}>
                                                <CameraAlt />
                                            </IconButton>
                                        </label>
                                    </>
                                )}
                            </Box>
                            <CardContent sx={{ pt: 0, px: 4, pb: 4 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", mt: -8 }}>
                                    <Box sx={{ position: "relative" }}>
                                        <Avatar src={profile.avatarUrl} sx={{ width: 150, height: 150, boxShadow: 3, fontSize: "3rem", bgcolor: "primary.main" }}>{profile.name ? profile.name[0] : "U"}</Avatar>
                                        {isOwner && (
                                            <>
                                                <input
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    id="avatar-upload"
                                                    type="file"
                                                    onChange={(e) => handleImageUpload(e, 'avatar')}
                                                />
                                                <label htmlFor="avatar-upload">
                                                    <IconButton component="span" sx={{ position: "absolute", bottom: 5, right: 5, bgcolor: "white", boxShadow: 1 }} size="small">
                                                        <CameraAlt fontSize="small" />
                                                    </IconButton>
                                                </label>
                                            </>
                                        )}
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        {isOwner && <Button variant="outlined" startIcon={<Edit />} onClick={() => { setEditedProfile(profile); setEditProfileOpen(true); }} sx={{ textTransform: "none" }}>Edit Profile</Button>}
                                    </Box>
                                </Box>
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{profile.name}</Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>{profile.headline}</Typography>
                                    <Box sx={{ display: "flex", gap: 3, mt: 2, flexWrap: "wrap", color: "text.secondary" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Business fontSize="small" /><Typography variant="body2">{profile.company}</Typography></Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><School fontSize="small" /><Typography variant="body2">{education[0] ? education[0].school : "University"}</Typography></Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><LocationOn fontSize="small" /><Typography variant="body2">{profile.location}</Typography></Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        <Box sx={{ display: "grid", gridTemplateColumns: { md: "2fr 1fr" }, gap: 4 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {/* About */}
                                <Card><CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                        <Typography variant="h6" fontWeight={700} fontFamily="'Playfair Display', serif">About</Typography>
                                        {isOwner && <IconButton size="small" onClick={() => { setEditedAbout(profile.about); setEditAboutOpen(true); }}><Edit fontSize="small" /></IconButton>}
                                    </Box>
                                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{profile.about}</Typography>
                                </CardContent></Card>

                                {/* Experience */}
                                <Card><CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                        <Typography variant="h6" fontWeight={700} fontFamily="'Playfair Display', serif">Experience</Typography>
                                        {isOwner && <IconButton size="small" onClick={() => setAddExperienceOpen(true)}><Add /></IconButton>}
                                    </Box>
                                    {experiences.length > 0 ? (
                                        <List disablePadding>{experiences.map((exp, i) => (
                                            <Box key={exp.id || i}><ListItem sx={{ px: 0, alignItems: "flex-start" }}><Box sx={{ mr: 2 }}><Work color="primary" /></Box><ListItemText primary={exp.title} secondary={<><Typography variant="body2" component="span" display="block">{exp.company}</Typography><Typography variant="body2" component="span" display="block" color="text.secondary">{exp.startDate} - {exp.endDate} · {exp.location}</Typography><Typography variant="body2" component="span" display="block" sx={{ mt: 1 }}>{exp.description}</Typography></>} /><ListItemSecondaryAction>{isOwner && <IconButton size="small" onClick={() => handleDeleteExperience(exp.id)}><Delete fontSize="small" /></IconButton>}</ListItemSecondaryAction></ListItem>{i < experiences.length - 1 && <Divider sx={{ my: 2 }} />}</Box>
                                        ))}</List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                                            No experience added yet. {isOwner && "Click the + button to add your first experience."}
                                        </Typography>
                                    )}</CardContent></Card>

                                {/* Education */}
                                <Card><CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                        <Typography variant="h6" fontWeight={700} fontFamily="'Playfair Display', serif">Education</Typography>
                                        {isOwner && <IconButton size="small" onClick={() => setAddEducationOpen(true)}><Add /></IconButton>}
                                    </Box>
                                    {education.length > 0 ? (
                                        <List disablePadding>{education.map((edu, i) => (
                                            <Box key={edu.id || i}><ListItem sx={{ px: 0, alignItems: "flex-start" }}><Box sx={{ mr: 2 }}><School color="action" /></Box><ListItemText primary={edu.school} secondary={<><Typography variant="body2" component="span" display="block">{edu.degree}, {edu.field}</Typography><Typography variant="body2" component="span" display="block" color="text.secondary">{edu.startDate} - {edu.endDate}</Typography></>} /><ListItemSecondaryAction>{isOwner && <IconButton size="small" onClick={() => handleDeleteEducation(edu.id)}><Delete fontSize="small" /></IconButton>}</ListItemSecondaryAction></ListItem>{i < education.length - 1 && <Divider sx={{ my: 2 }} />}</Box>
                                        ))}</List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                                            No education added yet. {isOwner && "Click the + button to add your education."}
                                        </Typography>
                                    )}</CardContent></Card>
                            </Box>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {/* Skills */}
                                <Card><CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                        <Typography variant="h6" fontWeight={700} fontFamily="'Playfair Display', serif">Skills</Typography>
                                        {isOwner && <IconButton size="small" onClick={() => setAddSkillOpen(true)}><Add /></IconButton>}
                                    </Box>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{skills.map((skill, i) => (<Chip key={i} label={skill} onDelete={isOwner ? () => handleDeleteSkill(skill) : undefined} />))}</Box>
                                </CardContent></Card>
                                {/* Contact */}
                                <Card><CardContent><Typography variant="h6" fontWeight={700} fontFamily="'Playfair Display', serif" sx={{ mb: 2 }}>Contact</Typography><List disablePadding><ListItem sx={{ px: 0 }}><Email sx={{ mr: 2 }} /><ListItemText primary="Email" secondary={profile.email} /></ListItem><ListItem sx={{ px: 0 }}><Phone sx={{ mr: 2 }} /><ListItemText primary="Phone" secondary={profile.phone} /></ListItem><ListItem sx={{ px: 0 }}><LinkIcon sx={{ mr: 2 }} /><ListItemText primary="Website" secondary={<a href={`https://${profile.website}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>{profile.website} <OpenInNew sx={{ fontSize: 12, ml: 0.5 }} /></a>} /></ListItem></List></CardContent></Card>
                            </Box>
                        </Box>

                        {/* User Posts - Full Width */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" fontWeight={700} fontFamily="'Playfair Display', serif" sx={{ mb: 2 }}>Activity</Typography>
                            {postsLoading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : userPosts?.length > 0 ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    {userPosts.map((post) => (
                                        <PostCard key={post.postId} post={post} />
                                    ))}
                                </Box>
                            ) : (
                                <Card>
                                    <CardContent>
                                        <Typography color="text.secondary" align="center">No posts yet.</Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Box>

                        {/* --- Dialogs --- */}
                        {/* Edit Profile Dialog */}
                        <Dialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} maxWidth="sm" fullWidth>
                            <DialogTitle>Edit Intro</DialogTitle>
                            <DialogContent>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                                    <TextField label="Headline" fullWidth multiline rows={2} value={editedProfile.headline || ""} onChange={(e) => setEditedProfile({ ...editedProfile, headline: e.target.value })} />
                                    <Autocomplete
                                        freeSolo
                                        options={locationOptions}
                                        loading={locationLoading}
                                        value={editedProfile.location || ""}
                                        onInputChange={(e, newValue) => setEditedProfile({ ...editedProfile, location: newValue })}
                                        renderInput={(params) => <TextField {...params} label="Location" fullWidth InputProps={{ ...params.InputProps, endAdornment: (<>{locationLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>) }} />}
                                    />
                                    <TextField label="Website" fullWidth value={editedProfile.website || ""} onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })} />
                                </Box>
                            </DialogContent>
                            <DialogActions><Button onClick={() => setEditProfileOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleSaveProfile}>Save</Button></DialogActions>
                        </Dialog>

                        {/* Edit About, Add Skill - Same as before */}
                        <Dialog open={editAboutOpen} onClose={() => setEditAboutOpen(false)} maxWidth="sm" fullWidth><DialogTitle>Edit About</DialogTitle><DialogContent><TextField fullWidth multiline rows={6} value={editedAbout} onChange={(e) => setEditedAbout(e.target.value)} sx={{ mt: 1 }} /></DialogContent><DialogActions><Button onClick={() => setEditAboutOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleSaveAbout}>Save</Button></DialogActions></Dialog>
                        <Dialog open={addSkillOpen} onClose={() => setAddSkillOpen(false)} maxWidth="xs" fullWidth>
                            <DialogTitle>Add Skill</DialogTitle>
                            <DialogContent>
                                <Autocomplete
                                    freeSolo
                                    options={skillOptions}
                                    loading={skillLoading}
                                    onInputChange={(e, newValue) => {
                                        setNewSkill(newValue);
                                        // Debounce logic handled in useEffect below
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Skill"
                                            fullWidth
                                            sx={{ mt: 1 }}
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {skillLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setAddSkillOpen(false)}>Cancel</Button>
                                <Button variant="contained" onClick={handleAddSkill}>Add</Button>
                            </DialogActions>
                        </Dialog>

                        {/* Add Experience Dialog */}
                        <Dialog open={addExperienceOpen} onClose={() => setAddExperienceOpen(false)} maxWidth="sm" fullWidth>
                            <DialogTitle>Add Experience</DialogTitle>
                            <DialogContent>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                                    <Autocomplete
                                        freeSolo
                                        options={titleOptions}
                                        loading={titleLoading}
                                        onInputChange={(e, newValue) => setNewExperience({ ...newExperience, title: newValue })}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Title"
                                                fullWidth
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {titleLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                    <Autocomplete freeSolo options={companyOptions} getOptionLabel={(option) => typeof option === 'string' ? option : option.name} filterOptions={(x) => x} loading={companyLoading} onInputChange={(e, newValue) => setNewExperience({ ...newExperience, company: newValue })} renderInput={(params) => <TextField {...params} label="Company" fullWidth InputProps={{ ...params.InputProps, endAdornment: (<>{companyLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>) }} />} />
                                    <Autocomplete
                                        freeSolo
                                        options={locationOptions}
                                        loading={locationLoading}
                                        onInputChange={(e, newValue) => setNewExperience({ ...newExperience, location: newValue })}
                                        renderInput={(params) => <TextField {...params} label="City, Country" fullWidth InputProps={{ ...params.InputProps, endAdornment: (<>{locationLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>) }} />}
                                    />
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <DatePicker label="Start Date" value={newExperience.startDate} onChange={(val) => setNewExperience({ ...newExperience, startDate: val })} slotProps={{ textField: { fullWidth: true } }} />
                                        <DatePicker label="End Date" value={newExperience.endDate} onChange={(val) => setNewExperience({ ...newExperience, endDate: val })} slotProps={{ textField: { fullWidth: true } }} />
                                    </Box>
                                    <TextField label="Description" fullWidth multiline rows={3} value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} />
                                </Box>
                            </DialogContent>
                            <DialogActions><Button onClick={() => setAddExperienceOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleAddExperience}>Add</Button></DialogActions>
                        </Dialog>

                        {/* Add Education Dialog */}
                        <Dialog open={addEducationOpen} onClose={() => setAddEducationOpen(false)} maxWidth="sm" fullWidth>
                            <DialogTitle>Add Education</DialogTitle>
                            <DialogContent>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                                    <Autocomplete freeSolo options={schoolOptions} filterOptions={(x) => x} loading={schoolLoading} onInputChange={(e, newValue) => setNewEducation({ ...newEducation, school: newValue })} renderInput={(params) => <TextField {...params} label="School" fullWidth InputProps={{ ...params.InputProps, endAdornment: (<>{schoolLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>) }} />} />
                                    <TextField label="Degree" fullWidth value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} />
                                    <TextField label="Field" fullWidth value={newEducation.field} onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })} />
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <DatePicker label="Start Date" value={newEducation.startDate} onChange={(val) => setNewEducation({ ...newEducation, startDate: val })} slotProps={{ textField: { fullWidth: true } }} />
                                        <DatePicker label="End Date" value={newEducation.endDate} onChange={(val) => setNewEducation({ ...newEducation, endDate: val })} slotProps={{ textField: { fullWidth: true } }} />
                                    </Box>
                                </Box>
                            </DialogContent>
                            <DialogActions><Button onClick={() => setAddEducationOpen(false)}>Cancel</Button><Button variant="contained" onClick={handleAddEducation}>Add</Button></DialogActions>
                        </Dialog>

                    </Box>
                </Box>
            </Box>
        </LocalizationProvider >
    );
};

export default ProfilePage;
