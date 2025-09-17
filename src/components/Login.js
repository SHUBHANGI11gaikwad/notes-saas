
import { useState } from "react";
import axios from "axios";
//import './App.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const BASE_URL = process.env.BASEURL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Always use /api/auth/login
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email, password }
      );
      console.log("Login Response:", res);
      console.log("Res.data:", res.data);
      if (!res.data || !res.data.token) {
        setError("Invalid server response");
        return;
      }
      localStorage.setItem("token", res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      console.error("Login Error:", err);
    }
  };

  return (
    <div className='center-card'>
    <h1>Login</h1>
    <form onSubmit={handleSubmit}>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="btn" type="submit">Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>

    </div>
  );
}
