import { useState } from "react";
import { motion } from "framer-motion";
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from "@mui/material";
import { Logout, Person, Settings } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { logout, logoutUser } from "../../store/slices/authSlice.js";
import { useNavigate } from "react-router-dom";

export const UserMenu = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    await dispatch(logoutUser());
    navigate("/auth");
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    return user?.name || user?.email || "User";
  };

  return (
    <>
      <motion.div whileHover={{ scale: 1.05 }}>
        <Avatar
          onClick={handleClick}
          // Fallback to name initials if no avatar is present (add avatarUrl check if available in user object)
          src={user?.avatarUrl}
          sx={{
            width: 36,
            height: 36,
            fontSize: 14,
            cursor: "pointer",
            border: "2px solid",
            borderColor: "secondary.main",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          {!user?.avatarUrl && getInitials()}
        </Avatar>
      </motion.div>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: 3,
            boxShadow: "0 4px 20px -4px hsla(150, 25%, 45%, 0.15)",
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {getDisplayName()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={() => { handleClose(); navigate("/profile/me"); }} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>

        <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleSignOut} sx={{ py: 1.5, color: "error.main" }}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </MenuItem>
      </Menu>
    </>
  );
};
