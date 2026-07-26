import { motion } from "framer-motion";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material";
import {
  LocationOn,
  Business,
  OpenInNew,
  EmojiEvents,
  TrendingUp,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// const stats = [
//   { label: "Profile Views", value: "2,847", change: "+12%" },
//   { label: "Post Impressions", value: "48.2K", change: "+28%" },
//   { label: "Search Appearances", value: "892", change: "+8%" },
// ];

// const skills = ["React", "TypeScript", "Node.js", "Python", "AWS"];

export const ProfileSidebar = () => {

  const navigate=useNavigate();
  const { user, userProfile } = useSelector((state) => state.auth);

  if (!user || !userProfile) return null;

  const city = userProfile.location?.split(",")[0];
  console.log(city)

  const skills = userProfile.skills
    ? userProfile.skills.split(",").map((s) => s.trim())
    : [];

  let experiences = [];

  try {
    experiences = userProfile?.experience
      ? JSON.parse(userProfile.experience)
      : [];
  } catch (e) {
    console.error("Failed to parse experience", e);
  }

  const currentExperience =
    experiences.find((exp) =>
      exp.duration?.toLowerCase().includes("present")
    ) || experiences[0];

  const currentCompany = currentExperience?.company;
    console.log(currentCompany)

  console.log(user, userProfile)

  return (
    <motion.aside
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{ width: 320 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Profile Card */}
        <Card>
          {/* Banner */}
          <Box
            sx={{
              height: 80,
              background: "linear-gradient(135deg, hsla(150, 25%, 45%, 0.2), hsla(350, 30%, 85%, 0.3), hsla(25, 30%, 75%, 0.3))",
              position: "relative",
            }}
          />

          {/* Avatar */}
          <Box sx={{ px: 2, mt: -5, position: "relative", zIndex: 1 }}>
            <motion.div whileHover={{ scale: 1.03 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  border: "4px solid",
                  borderColor: "background.paper",
                  fontSize: "1.5rem",
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  boxShadow: 2,
                }}

                src={userProfile.avatarUrl || undefined}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </motion.div>
          </Box>

          <CardContent sx={{ pt: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
            >
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {userProfile.headline}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocationOn sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {city}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Business sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {currentCompany || "N/A"}
                </Typography>
              </Box>
            </Box>

            {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                500+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                connections
              </Typography>
            </Box> */}

            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button variant="contained" fullWidth onClick={() =>navigate('/profile/me')}>
                Edit Profile
              </Button>
              <IconButton
                sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}
              >
                <OpenInNew sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </CardContent>
        </Card>

        {/* Skills Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <EmojiEvents sx={{ fontSize: 18, color: "warning.main" }} />
                <Typography
                  variant="subtitle2"
                  sx={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Top Skills
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <Chip
                      label={skill}
                      size="small"
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        },
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </motion.aside>
  );
};
