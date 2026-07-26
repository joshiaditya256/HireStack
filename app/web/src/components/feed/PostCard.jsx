import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Box,
  Divider,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from "@mui/material";
import {
  ThumbUpOutlined,
  ThumbUp,
  CommentOutlined,
  ShareOutlined,
  MoreVert,
  Send
} from "@mui/icons-material";
import { likePost, addComment, fetchComments } from "../../store/slices/feedSlice";

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  if (!post) return null;

  const handleLike = () => {
    dispatch(likePost({ postId: post.postId }));
  };

  const handleCommentClick = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const result = await dispatch(fetchComments({ postId: post.postId })).unwrap();
        setComments(result.data || []);
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!commentContent.trim()) return;
    try {
      const result = await dispatch(addComment({ postId: post.postId, content: commentContent })).unwrap();
      if (result.data) {
        setComments([result.data, ...comments]); // Prepend new comment
        setCommentContent("");
      }
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={
          <Avatar
            src={post.user?.avatarUrl}
            alt={post.user?.name || "User"}
          >
            {(post.user?.name || "U")[0]}
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVert />
          </IconButton>
        }
        title={
          <span style={{ fontWeight: 600 }}>
            {post.user?.name || "Unknown User"}
          </span>
        }
        subheader={post.user?.headline || "Member"}
      />
      <CardContent sx={{ py: 1 }}>
        <Typography variant="body1" color="text.primary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
          {post.content}
        </Typography>
        {post.imageUrl && (
          <Box
            component="img"
            src={post.imageUrl}
            alt="Post content"
            sx={{
              width: "100%",
              maxHeight: 500,
              objectFit: "cover",
              borderRadius: 1
            }}
          />
        )}
      </CardContent>
      <Divider />
      <CardActions disableSpacing sx={{ justifyContent: "space-between", px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton aria-label="like" onClick={handleLike} color={post.isLiked ? "primary" : "default"}>
            {post.isLiked ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {post.likesCount > 0 ? post.likesCount : ""}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton aria-label="comment" onClick={handleCommentClick}>
            <CommentOutlined fontSize="small" />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {post.commentsCount > 0 ? post.commentsCount : ""}
          </Typography>
        </Box>

        <IconButton aria-label="share">
          <ShareOutlined fontSize="small" />
        </IconButton>
      </CardActions>

      {/* Comments Section */}
      {showComments && (
        <>
          <Divider />
          <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                sx={{ bgcolor: 'background.paper' }}
              />
              <IconButton color="primary" onClick={handleAddComment} disabled={!commentContent.trim()}>
                <Send />
              </IconButton>
            </Box>

            <List disablePadding>
              {comments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar src={comment.userAvatar} sx={{ width: 32, height: 32 }}>
                      {(comment.userName || "U")[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" component="span">
                        {comment.userName}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.primary">
                        {comment.content}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              {comments.length === 0 && !loadingComments && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1 }}>
                  No comments yet. Be the first!
                </Typography>
              )}
            </List>
          </Box>
        </>
      )}
    </Card>
  );
};

export default PostCard;
