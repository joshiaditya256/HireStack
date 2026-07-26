import { Box, Typography, IconButton, CardContent, Chip } from "@mui/material";
import { Add } from "@mui/icons-material";
import { motion } from "framer-motion";

const ProfileSkills = ({ skills = [], onAdd, onDelete }) => {
    // Ensure skills is an array
    const skillList = Array.isArray(skills) ? skills : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <Box
                sx={{
                    mb: 2,
                    bgcolor: "background.paper",
                    borderRadius: 4,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                            Skills
                        </Typography>
                        <IconButton size="small" onClick={onAdd}>
                            <Add fontSize="small" />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {skillList.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                Add skills to showcase your expertise.
                            </Typography>
                        ) : skillList.map((skill, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Chip
                                    label={skill}
                                    onDelete={() => onDelete(skill)}
                                    sx={{
                                        borderRadius: 2,
                                        fontWeight: 500,
                                        "& .MuiChip-deleteIcon": {
                                            color: "text.secondary",
                                            "&:hover": { color: "error.main" },
                                        },
                                    }}
                                />
                            </motion.div>
                        ))}
                    </Box>
                </CardContent>
            </Box>
        </motion.div>
    );
};

export default ProfileSkills;
