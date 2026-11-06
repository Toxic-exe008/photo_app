import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [photos, setPhotos] = useState([]);
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [editId, setEditId] = useState(null);
    const API = "http://localhost:5000/api/photos";

//read photos
    const getPhotos = async () => {
        const response = await axios.get(API);
        setPhotos(response.data);
    };

    useEffect(() => {
        getPhotos();
    }, []);

//create and update 
    const handleSubmit = async (e) => {
        e.preventDefault();

        const photoData = {
            title,
            imageUrl
        };

        if (editId) {
            await axios.put(`${API}/${editId}`, photoData);
            alert("Photo Updated!");
        } else {
            await axios.post(API, photoData);
            alert("Photo Added!");
        }

        setTitle("");
        setImageUrl("");
        setEditId(null);

        getPhotos();
    };

//edit photo
    const handleEdit = (photo) => {
        setTitle(photo.title);
        setImageUrl(photo.imageUrl);
        setEditId(photo._id);
    };

    //delete photo
    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this photo?"
        );

        if (confirmDelete) {
            await axios.delete(`${API}/${id}`);
            alert("Photo Deleted!");
            getPhotos();
        }
    };

    return (
        <div className="container">
            <title>photo-app</title>
            <h1>My Photo Gallery</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Enter Photo Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <input
                    type="url"
                    placeholder="Enter Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                />

                <button type="submit">
                    {editId ? "Update Photo" : "Add Photo"}
                </button>

            </form>

            <div className="gallery">

                {photos.map((photo) => (

                    <div className="card" key={photo._id}>

                        <img
                            src={photo.imageUrl}
                            alt={photo.title}
                        />

                        <h3>{photo.title}</h3>

                        <button onClick={() => handleEdit(photo)}>
                            Edit
                        </button>

                        <button
                            className="delete"
                            onClick={() => handleDelete(photo._id)}
                        >
                            Delete
                        </button>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default App;