import { Box, Typography, IconButton, CardContent, List, ListItem, ListItemText, ListItemSecondaryAction, Divider } from "@mui/material";
import { Add, Work, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";

const ProfileExperience = ({ experiences = [], onAdd, onDelete }) => {
    // Ensure experiences is an array
    const expList = Array.isArray(experiences) ? experiences : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
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
                            Experience
                        </Typography>
                        <IconButton size="small" onClick={onAdd}>
                            <Add fontSize="small" />
                        </IconButton>
                    </Box>

                    {expList.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                            No experience added yet.
                        </Typography>
                    ) : (
                        <List disablePadding>
                            {expList.map((exp, index) => (
                                <Box key={exp.id || index}>
                                    <ListItem sx={{ px: 0, alignItems: "flex-start" }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 3,
                                                bgcolor: "secondary.light", // Using theme color
                                                opacity: 0.8,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                mr: 2,
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Work sx={{ color: "primary.dark" }} />
                                        </Box>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {exp.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>{exp.company}</Typography>
                                                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                                                        {exp.startDate} - {exp.endDate} · {exp.location}
                                                    </Typography>
                                                    {exp.description && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                            {exp.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton size="small" onClick={() => onDelete(exp.id)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < expList.length - 1 && <Divider sx={{ my: 2 }} />}
                                </Box>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Box>
        </motion.div>
    );
};

export default ProfileExperience;
