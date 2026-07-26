import { Box, Typography, IconButton, CardContent } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { motion } from "framer-motion";

const ProfileAbout = ({ about, onEdit }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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
                            About
                        </Typography>
                        <IconButton size="small" onClick={onEdit}>
                            <Edit fontSize="small" />
                        </IconButton>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                        {about || "Write something about yourself..."}
                    </Typography>
                </CardContent>
            </Box>
        </motion.div>
    );
};

export default ProfileAbout;
