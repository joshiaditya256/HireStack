import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Paper, Avatar, TextField, Button, Typography, IconButton } from "@mui/material";
import { Image, Send, Close } from "@mui/icons-material";
import { createPost } from "../../store/slices/feedSlice";
import feedInstance from "../../lib/feedInstance";

const CreatePost = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setImageUrl(preview);
      setShowImageInput(true);
      setUploadError(null);
    }
  };

  const clearImage = () => {
    setImageUrl("");
    setSelectedFile(null);
    setShowImageInput(false);
    setUploadError(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile) return;

    setLoading(true);
    setUploadError(null);

    let finalImageUrl = imageUrl;

    try {
      // proper upload if file selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        // Upload to backend
        const uploadRes = await feedInstance.post("/api/feed/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        finalImageUrl = uploadRes.data;
      }

      await dispatch(createPost({ content, imageUrl: finalImageUrl })).unwrap();

      setContent("");
      clearImage();
    } catch (err) {
      console.error("Upload/Post failed", err);
      setUploadError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Avatar src={user?.profile?.avatarUrl}>
          {(user?.name || "U")[0]}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            placeholder="Start a post, share your thoughts..."
            multiline
            rows={2}
            variant="outlined"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 1, bgcolor: "grey.50" }}
          />

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            id="image-upload"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          {showImageInput && imageUrl && (
            <Box sx={{ position: "relative", mb: 2 }}>
              <img
                src={imageUrl}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px" }}
              />
              <IconButton
                size="small"
                onClick={clearImage}
                sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(0,0,0,0.6)", color: "white", "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}
              >
                <Close />
              </IconButton>
            </Box>
          )}

          {uploadError && (
            <Typography color="error" variant="caption" display="block" sx={{ mb: 1 }}>
              {uploadError}
            </Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label htmlFor="image-upload">
              <IconButton
                component="span"
                color={showImageInput ? "primary" : "default"}
              >
                <Image />
              </IconButton>
            </label>
            <Button
              variant="contained"
              size="small"
              endIcon={<Send />}
              onClick={handleSubmit}
              disabled={(!content.trim() && !selectedFile) || loading}
            >
              {loading ? "Posting..." : "Post"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default CreatePost;
