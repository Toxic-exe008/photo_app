import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API_ROOT = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API = `${API_ROOT.endsWith("/") ? API_ROOT.slice(0, -1) : API_ROOT}/api/photos`;

function App() {
    const [photos, setPhotos] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const fileInputRef = useRef(null);

    const getImageSrc = (photo) => {
        return photo.imageId ? `${API}/${photo._id}/image` : photo.imageUrl;
    };

    //read photos
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

    useEffect(() => {
        if (!selectedPhoto) return;

        const closeOnEscape = (event) => {
            if (event.key === "Escape") {
                setSelectedPhoto(null);
            }
        };

        document.addEventListener("keydown", closeOnEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = "";
        };
    }, [selectedPhoto]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setImageUrl("");
        setImageFile(null);
        setEditId(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    //create and update 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!editId && !imageFile && !imageUrl.trim()) {
            setError("Choose an image or enter an image URL.");
            return;
        }

        const photoData = new FormData();
        photoData.append("title", title.trim());
        photoData.append("description", description.trim());

        if (imageFile) {
            photoData.append("image", imageFile);
        } else if (imageUrl.trim()) {
            photoData.append("imageUrl", imageUrl.trim());
        }

        try {
            if (editId) {
                await axios.put(`${API}/${editId}`, photoData);
                setMessage("Photo updated.");
            } else {
                await axios.post(API, photoData);
                setMessage("Photo added.");
            }

            resetForm();
            await getPhotos();
        } catch (err) {
            setError(err.response?.data?.message || "Couldn't save the photo. Please try again.");
        }
    };

    //edit photo
    const handleEdit = (photo) => {
        setTitle(photo.title);
        setDescription(photo.description || "");
        setImageUrl(photo.imageUrl || "");
        setImageFile(null);
        setEditId(photo._id);
        setMessage("");
        setError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    //delete photo
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

    const filteredPhotos = photos.filter((photo) =>
        photo.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    return (
        <div className="app">
            <header className="navbar">
                <div className="nav-inner">
                    <a className="brand" href="/">My Photo Gallery</a>
                    <div className="search-box">
                        <input
                            type="search"
                            placeholder="Search by title..."
                            aria-label="Search photos by title"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className="container">
                <section className="intro">
                    <h1>Your photos</h1>
                    <p className="subtitle">Add your photos and keep them all in one place.</p>
                </section>

                <form className="photo-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter Photo Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength="100"
                        required
                    />

                    <textarea
                        placeholder="Add a description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength="500"
                        rows="3"
                    />

                    <input
                        type="url"
                        placeholder="Enter Image URL (optional if uploading a file)"
                        value={imageUrl}
                        onChange={(e) => {
                            setImageUrl(e.target.value);
                            if (e.target.value) setImageFile(null);
                        }}
                    />

                    <div className="file-field">
                        <label htmlFor="photo-file">Or choose an image from your device</label>
                        <input
                            id="photo-file"
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(e) => {
                                const file = e.target.files[0] || null;
                                setImageFile(file);
                                if (file) setImageUrl("");
                            }}
                        />
                    </div>

                    {imageFile && <p className="file-name">Selected: {imageFile.name}</p>}
                    {editId && !imageUrl && !imageFile && (
                        <p className="file-name">Leave both image fields empty to keep the current image.</p>
                    )}

                    <div className="form-actions">
                        <button type="submit">
                            {editId ? "Update Photo" : "Add Photo"}
                        </button>
                        {editId && (
                            <button type="button" className="secondary" onClick={resetForm}>
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
                ) : filteredPhotos.length === 0 ? (
                    <p className="empty-state">No photos found for "{searchTerm}".</p>
                ) : (
                    <div className="gallery">
                        {filteredPhotos.map((photo) => (
                            <div className="card" key={photo._id}>
                                <button
                                    type="button"
                                    className="photo-image"
                                    onClick={() => setSelectedPhoto(photo)}
                                    aria-label={`Preview ${photo.title}`}
                                >
                                    <img src={getImageSrc(photo)} alt={photo.title} loading="lazy" />
                                </button>
                                <h3>{photo.title}</h3>
                                {photo.description && <p className="card-description">{photo.description}</p>}
                                <div className="card-actions">
                                    <button type="button" onClick={() => handleEdit(photo)}>Edit</button>
                                    <button
                                        type="button"
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
            </main>

            {selectedPhoto && (
                <div className="preview-backdrop" onClick={() => setSelectedPhoto(null)}>
                    <div
                        className="preview-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-label={selectedPhoto.title}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="preview-close"
                            aria-label="Close preview"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            ×
                        </button>
                        <img src={getImageSrc(selectedPhoto)} alt={selectedPhoto.title} />
                        <div className="preview-details">
                            <h2>{selectedPhoto.title}</h2>
                            {selectedPhoto.description && <p>{selectedPhoto.description}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
