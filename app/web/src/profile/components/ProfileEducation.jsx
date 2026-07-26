import { Box, Typography, IconButton, CardContent, List, ListItem, ListItemText, ListItemSecondaryAction, Divider } from "@mui/material";
import { Add, School, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";

const ProfileEducation = ({ education = [], onAdd, onDelete }) => {
    // Ensure education is an array
    const eduList = Array.isArray(education) ? education : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
                            Education
                        </Typography>
                        <IconButton size="small" onClick={onAdd}>
                            <Add fontSize="small" />
                        </IconButton>
                    </Box>

                    {eduList.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                            No education added yet.
                        </Typography>
                    ) : (
                        <List disablePadding>
                            {eduList.map((edu, index) => (
                                <Box key={edu.id || index}>
                                    <ListItem sx={{ px: 0, alignItems: "flex-start" }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 3,
                                                bgcolor: "action.hover",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                mr: 2,
                                                flexShrink: 0,
                                            }}
                                        >
                                            <School sx={{ color: "text.secondary" }} />
                                        </Box>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {edu.school}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2">
                                                        {edu.degree}, {edu.field}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {edu.startDate} - {edu.endDate}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton size="small" onClick={() => onDelete(edu.id)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < eduList.length - 1 && <Divider sx={{ my: 2 }} />}
                                </Box>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Box>
        </motion.div>
    );
};

export default ProfileEducation;
