// src/components/Notes.js

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;

  // const BASE_URL = process.env.BASE_URL || "http://localhost:3000/api";

  // fetchNotes—useCallback
  const fetchNotes = useCallback(async () => {
    try {
      const skip = (page - 1) * limit;
      const token = localStorage.getItem("token");
      const url = `/notes?limit=${limit}&skip=${skip}&search=${search}`;
      console.log("Fetching notes with token:", token);
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch (error) {
      console.error("Error fetching notes:", error.response || error);
    }
  }, [page, search]);


  useEffect(() => { fetchNotes(); }, [fetchNotes]);


  // Add or Edit Note
  const handleSave = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token"); // Fresh each time!

  if (editId) {
    await axios.put(
      `${BASE_URL}/notes/${editId}`,
      { title, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setEditId(null);
  } else {
    await axios.post(
      `${BASE_URL}/notes`,
      { title, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  setTitle(""); setContent("");
  fetchNotes(); // Reload notes
};


  // Edit Button Logic
  const startEdit = (note) => {
    setEditId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  // Delete Note
  const handleDelete = async (id) => {
  const token = localStorage.getItem("token");
  await axios.delete(
    `${BASE_URL}/notes/${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  fetchNotes();
};


  return (
    <div className='center-card' >
      <h2>Notes</h2>
      
      <form onSubmit={handleSave}>
        <input 
        placeholder="Search notes"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button className="btn" type="submit">{editId ? "Update" : "Add"} Note</button>
        {editId &&
          <button className="btn" type="button" onClick={() => { setEditId(null); setTitle(""); setContent(""); }}>
            Cancel
          </button>
        } 
      </form>
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            <div className="note-row">
            <span>
            <b>{note.title}</b>: 
            {note.content && " " + note.content}
            </span>
            <button className="btn btn-edit" onClick={() => startEdit(note)}>Edit</button>
            <button className="btn btn-delete" onClick={() => handleDelete(note.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <button className="btn btn-prev" onClick={() => setPage(page - 1)} disabled={page === 1}>Prev</button>
      <span className="let"> Page {page} </span>
      <button className="btn btn-prev" onClick={() => setPage(page + 1)} disabled={notes.length < limit}>Next</button>
    </div>
  );
}
