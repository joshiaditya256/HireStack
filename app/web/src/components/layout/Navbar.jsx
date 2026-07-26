import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  AppBar,
  Toolbar,
  Box,
  TextField,
  IconButton,
  Badge,
  Button,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  Search,
  Home,
  People,
  Work,
  Message,
  Notifications,
  RssFeed,
  Menu,
} from "@mui/icons-material";
// import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "../auth/UserMenu";

import { useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Feed", icon: RssFeed, path: "/feed" },
  { label: "Network", icon: People, path: "/network" },
  { label: "Jobs", icon: Work, path: "/jobs" },
  { label: "Messaging", icon: Message, path: "/messaging" },
  { label: "Notifications", icon: Notifications, path: "/notifications" },
];

export const Navbar = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <AppBar position="fixed" color="default">
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
          {/* Left Side: Logo + Search */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  component="img"
                  src="/logo.svg"
                  alt="HireStack Logo"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <Box
                  component="span"
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 600,
                    fontSize: "1.25rem",
                    color: "text.primary",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  HireStack
                </Box>
              </Box>
            </motion.div>

            {/* Search */}
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <motion.div animate={{ width: searchFocused ? 360 : 260 }}>
                <TextField
                  size="small"
                  placeholder="Search..."
                  fullWidth
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>
            </Box>
          </Box>

          {/* Right Side: Nav Items + Profile */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            {/* Nav Items */}
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                gap: 1,
              }}
            >
              {navItems
                .filter((item) => {
                  if (!user) return ["Home", "Jobs"].includes(item.label);

                  if (user.role === "RECRUITER") {
                    return ["Home", "Jobs"].includes(item.label);
                  } else {
                    return ["Home", "Jobs"].includes(item.label);
                  }
                })
                .concat(user?.role === 'RECRUITER' ? [{ label: "Dashboard", icon: Work, path: "/recruiter/dashboard" }] : [])
                .map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2 }}
                      onClick={() => navigate(item.path)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        padding: "8px 16px",
                        borderRadius: 12,
                        border: "none",
                        background: isActive
                          ? "hsla(150, 25%, 45%, 0.08)"
                          : "transparent",
                        color: isActive
                          ? theme.palette.primary.main
                          : theme.palette.text.secondary,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                      <Box component="span" sx={{ fontSize: 12, fontWeight: 500 }}>
                        {item.label}
                      </Box>
                    </motion.button>
                  );
                })}
            </Box>

            {/* Profile & Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>


              {user ? (
                <UserMenu />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="contained"
                    onClick={() => navigate("/auth")}
                    sx={{ borderRadius: 2 }}
                  >
                    Sign In
                  </Button>
                </motion.div>
              )}

              <IconButton sx={{ display: { lg: "none" } }} size="small">
                <Menu />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
};
