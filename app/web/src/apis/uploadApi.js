import feedInstance from "../lib/feedInstance";

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await feedInstance.post("/api/feed/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};
