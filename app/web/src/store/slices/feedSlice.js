import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import feedInstance from "../../lib/feedInstance";

// Async thunks
export const fetchFeed = createAsyncThunk(
    "feed/fetchFeed",
    async ({ page = 0, size = 10 } = {}, { rejectWithValue, getState }) => {
        try {
            const { user } = getState().auth;
            const userId = user?.id; // Assuming user object has id

            const response = await feedInstance.get("/api/feed", {
                params: { page, size },
                headers: { "X-User-Id": userId }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch feed");
        }
    }
);

export const createPost = createAsyncThunk(
    "feed/createPost",
    async (postData, { rejectWithValue, getState }) => {
        try {
            const { user } = getState().auth;
            const userId = user?.id;

            if (!userId) throw new Error("User not authenticated");

            const response = await feedInstance.post(`/api/feed/user/${userId}`, postData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create post");
        }
    }
);

export const fetchUserPosts = createAsyncThunk(
    "feed/fetchUserPosts",
    async ({ userId, page = 0, size = 10 }, { rejectWithValue }) => {
        try {
            const response = await feedInstance.get(`/api/feed/user/${userId}`, {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch user posts");
        }
    }
);



export const likePost = createAsyncThunk(
    "feed/likePost",
    async ({ postId }, { rejectWithValue, getState }) => {
        try {
            const { user } = getState().auth;
            const userId = user?.id; // Needed for optimisitc update, but API uses header or token
            await feedInstance.post(`/api/feed/post/${postId}/like`, {}, {
                headers: { "X-User-Id": userId }
            });
            return { postId, userId };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to like post");
        }
    }
);

export const addComment = createAsyncThunk(
    "feed/addComment",
    async ({ postId, content }, { rejectWithValue, getState }) => {
        try {
            const { user } = getState().auth;
            const userId = user?.id;
            const response = await feedInstance.post(`/api/feed/post/${postId}/comment`, { content }, {
                headers: { "X-User-Id": userId }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to add comment");
        }
    }
);

export const fetchComments = createAsyncThunk(
    "feed/fetchComments",
    async ({ postId }, { rejectWithValue }) => {
        try {
            const response = await feedInstance.get(`/api/feed/post/${postId}/comments`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch comments");
        }
    }
);

const feedSlice = createSlice({
    name: "feed",
    initialState: {
        posts: [],
        userPosts: [],
        loading: false,
        error: null,
        hasMore: true,
        page: 0
    },
    reducers: {
        clearFeed: (state) => {
            state.posts = [];
            state.page = 0;
            state.hasMore = true;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Feed
            .addCase(fetchFeed.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFeed.fulfilled, (state, action) => {
                state.loading = false;
                const newPosts = action.payload.data?.content || [];
                const requestedPage = action.meta.arg?.page ?? 0;

                if (requestedPage === 0) {
                    state.posts = newPosts;
                    state.page = 1;
                } else {
                    const existingIds = new Set(state.posts.map(p => p.postId));
                    const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.postId));
                    state.posts = [...state.posts, ...uniqueNewPosts];
                    state.page += 1;
                }

                state.hasMore = !action.payload.data?.last;
                state.page += 1;
            })
            .addCase(fetchFeed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Post
            .addCase(createPost.fulfilled, (state, action) => {
                if (action.payload.data) {
                    state.posts.unshift(action.payload.data);
                }
            })
            // Like Post
            .addCase(likePost.fulfilled, (state, action) => {
                const { postId } = action.meta.arg;
                const post = state.posts.find(p => p.postId === postId);
                if (post) {
                    if (post.isLiked) {
                        post.likesCount = Math.max(0, post.likesCount - 1);
                        post.isLiked = false;
                    } else {
                        post.likesCount += 1;
                        post.isLiked = true;
                    }
                }
            })
            // Add Comment
            .addCase(addComment.fulfilled, (state, action) => {
                const { postId } = action.meta.arg;
                const post = state.posts.find(p => p.postId === postId);
                if (post) {
                    post.commentsCount += 1;
                }
            })
            // Fetch User Posts
            .addCase(fetchUserPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.userPosts = action.payload.data?.content || [];
            })
            .addCase(fetchUserPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearFeed } = feedSlice.actions;
export default feedSlice.reducer;
