import { Box, IconButton, Avatar, Typography, Button, TextField } from "@mui/material";
import { CameraAlt, Edit, LocationOn, Business, Link as LinkIcon } from "@mui/icons-material";
import { motion } from "framer-motion";

const ProfileHeader = ({ profile, onEditProfile, isEditing }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box
                sx={{
                    mb: 2,
                    overflow: "visible",
                    bgcolor: "background.paper",
                    borderRadius: 4,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    border: "1px solid",
                    borderColor: "divider",
                }}
                className="glass-card"
            >
                {/* Cover Image Area */}
                <Box
                    sx={{
                        height: 200,
                        background: "linear-gradient(135deg, hsla(150, 25%, 45%, 0.2), hsla(350, 30%, 85%, 0.3))",
                        position: "relative",
                        borderRadius: "16px 16px 0 0",
                    }}
                >
                    <IconButton
                        sx={{
                            position: "absolute",
                            right: 16,
                            top: 16,
                            bgcolor: "background.paper",
                            "&:hover": { bgcolor: "background.paper" },
                        }}
                    >
                        <CameraAlt fontSize="small" />
                    </IconButton>
                </Box>

                {/* Profile Content */}
                <Box sx={{ px: 3, pb: 4 }}>
                    {/* Avatar Section */}
                    <Box sx={{ mt: -8, mb: 2, position: "relative", display: "inline-block" }}>
                        <motion.div whileHover={{ scale: 1.02 }}>
                            <Avatar
                                src={profile.avatarUrl}
                                sx={{
                                    width: 150,
                                    height: 150,
                                    border: "4px solid",
                                    borderColor: "background.paper",
                                    fontSize: "3rem",
                                    bgcolor: "primary.main",
                                    boxShadow: 3,
                                }}
                            >
                                {profile.name ? profile.name[0] : "U"}
                            </Avatar>
                        </motion.div>
                        <IconButton
                            size="small"
                            sx={{
                                position: "absolute",
                                bottom: 8,
                                right: 8,
                                bgcolor: "background.paper",
                                boxShadow: 2,
                                "&:hover": { bgcolor: "grey.100" },
                            }}
                        >
                            <CameraAlt fontSize="small" />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                                {profile.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 600 }}>
                                {profile.headline || "Add a headline"}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 2, flexWrap: "wrap" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <LocationOn sx={{ fontSize: 18, color: "text.secondary" }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {profile.location || "Add location"}
                                    </Typography>
                                </Box>
                                {/* Add more info items here if needed */}
                            </Box>
                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={onEditProfile}
                            sx={{ borderRadius: 3, textTransform: "none" }}
                        >
                            Edit Profile
                        </Button>
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
};

export default ProfileHeader;
