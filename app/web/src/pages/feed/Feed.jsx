import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Container, CircularProgress, Typography, Grid } from "@mui/material";
import { fetchFeed } from "../../store/slices/feedSlice";
import PostCard from "../../components/feed/PostCard";
import { Navbar } from "../../components/layout/Navbar";
import CreatePost from "../../components/feed/CreatePost";

const Feed = () => {
    const dispatch = useDispatch();
    const { posts, loading, error } = useSelector((state) => state.feed);

    useEffect(() => {
        dispatch(fetchFeed());
    }, [dispatch]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 4 }}>
            <Navbar />
            <Container maxWidth="lg" sx={{ pt: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={3}>
                        {/* Left Sidebar Placeholder (Profile Summary) */}
                        <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2 }}>
                            <Typography variant="h6">My Profile</Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <CreatePost />
                        {/* Feed Section */}
                        {loading && posts.length === 0 ? (
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Typography color="error" align="center">{error}</Typography>
                        ) : (
                            <Box>
                                {posts.length === 0 ? (
                                    <Typography align="center" color="text.secondary">
                                        No posts yet. Be the first to post!
                                    </Typography>
                                ) : (
                                    posts.map((post) => (
                                        <PostCard key={post.postId} post={post} />
                                    ))
                                )}
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12} md={3}>
                        {/* Right Sidebar Placeholder (Recommendations) */}
                        <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2 }}>
                            <Typography variant="h6">Suggested</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Feed;
