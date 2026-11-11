import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_ROOT = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API = `${API_ROOT.endsWith("/") ? API_ROOT.slice(0, -1) : API_ROOT}/api/photos`;

function App() {
    const [photos, setPhotos] = useState([]);
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const getPhotos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(API);
            setPhotos(response.data);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Couldn't load photos. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getPhotos();
    }, [getPhotos]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        const photoData = { title: title.trim(), imageUrl: imageUrl.trim() };

        try {
            if (editId) {
                await axios.put(`${API}/${editId}`, photoData);
                setMessage("Photo updated.");
            } else {
                await axios.post(API, photoData);
                setMessage("Photo added.");
            }

            setTitle("");
            setImageUrl("");
            setEditId(null);
            await getPhotos();
        } catch (err) {
            setError(err.response?.data?.message || "Couldn't save the photo. Please try again.");
        }
    };

    const handleEdit = (photo) => {
        setTitle(photo.title);
        setImageUrl(photo.imageUrl);
        setEditId(photo._id);
        setMessage("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this photo?");

        if (!confirmDelete) return;

        try {
            await axios.delete(`${API}/${id}`);
            setMessage("Photo deleted.");
            await getPhotos();
        } catch (err) {
            setError(err.response?.data?.message || "Couldn't delete the photo. Please try again.");
        }
    };

    const cancelEdit = () => {
        setTitle("");
        setImageUrl("");
        setEditId(null);
    };

    return (
        <div className="container">
            <h1>My Photo Gallery</h1>
            <p className="subtitle">Add your photos and keep them all in one place.</p>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter Photo Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength="100"
                    required
                />

                <input
                    type="url"
                    placeholder="Enter Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                />

                <div className="form-actions">
                    <button type="submit">
                        {editId ? "Update Photo" : "Add Photo"}
                    </button>
                    {editId && (
                        <button type="button" className="secondary" onClick={cancelEdit}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {error && <p className="message error">{error}</p>}
            {message && <p className="message success">{message}</p>}

            {loading ? (
                <p className="empty-state">Loading photos...</p>
            ) : photos.length === 0 ? (
                <p className="empty-state">No photos yet. Add one using the form above.</p>
            ) : (
                <div className="gallery">
                    {photos.map((photo) => (
                        <div className="card" key={photo._id}>
                            <img src={photo.imageUrl} alt={photo.title} loading="lazy" />
                            <h3>{photo.title}</h3>
                            <div className="card-actions">
                                <button onClick={() => handleEdit(photo)}>Edit</button>
                                <button
                                    className="delete"
                                    onClick={() => handleDelete(photo._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
