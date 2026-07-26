import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { Navbar } from '../../components/layout/Navbar';
import { ProfileSidebar } from '../../components/layout/ProfileSidebar';
import { AnimatedBackground } from '../../components/background/AnimatedBackground';
import CreatePost from '../../components/feed/CreatePost';
import PostCard from '../../components/feed/PostCard';
import { motion } from "framer-motion";
import { fetchFeed } from '../../store/slices/feedSlice';

const Home = () => {
    const dispatch = useDispatch();
    const { posts, loading, error } = useSelector((state) => state.feed);

    useEffect(() => {
        dispatch(fetchFeed());
    }, [dispatch]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <AnimatedBackground />
            <Navbar />

            <Box component="main" sx={{ pt: 6, pb: 6, px: 2 }}>
                <Box sx={{ maxWidth: 1400, mx: "auto" }}>
                    <Box sx={{
                        display: "flex",
                        gap: 3,
                        justifyContent: "center",
                    }}>
                        <Box sx={{ display: { xs: "none", xl: "block" }, position: "sticky", top: 80, alignSelf: "flex-start" }}>
                            <ProfileSidebar />
                        </Box>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{ flex: 1, minWidth: 0 }}
                        >
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 800, mx: "auto", width: "100%" }}>
                                <CreatePost />

                                {loading && posts.length === 0 ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : error ? (
                                    <Typography color="error" align="center">{error}</Typography>
                                ) : (
                                    <>
                                        {posts.map((post) => (
                                            <PostCard key={post.postId} post={post} />
                                        ))}

                                        {posts.length > 0 && (
                                            {/* Load More */ },
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.8 }}
                                            >
                                                <Box sx={{ textAlign: "center", py: 4 }}>
                                                    <motion.div
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <Button
                                                            variant="contained"
                                                            sx={{
                                                                px: 4,
                                                                py: 1.5,
                                                                borderRadius: 3,
                                                            }}
                                                        >
                                                            Load More Posts
                                                        </Button>
                                                    </motion.div>
                                                </Box>
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </Box>
                        </motion.div>

                        {/* <Box sx={{ display: { xs: "none", lg: "block" } }}>
                            <ConnectionsSidebar />
                        </Box> */}

                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default Home


