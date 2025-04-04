import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Box, Button, Container, TextField, Paper, Typography, Link } from "@mui/material"
import ReactLogo from "../assets/react.svg"

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {

    e.preventDefault();

    try {

      const res = await fetch(`http://localhost:5002/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      if (res.ok) {
        alert("Called login")
      } else {
        alert('Login failed')
      }
    } catch (err) {
      console.error(err)
      alert('Something went wrong')
    }

    console.log("Logging in with:", email, password);
    navigate("/dashboard");
  };

  return (
    <Container maxWidth="xs" sx={{ bgcolor: "white", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, width: "100%", height: 415 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
          <img src={ReactLogo} alt="React Logo" width={60} />
        </Box>
        <Box component="form" onSubmit={handleSignup} noValidate sx={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
          <TextField value={email} onChange={(e) => setEmail(e.target.value)} variant="outlined" label="Enter email" fullWidth  sx={{height: 50}}/>
          <TextField value={password} onChange={(e) => setPassword(e.target.value)} variant="outlined" label="Enter password" type="password" fullWidth sx={{height: 50}} />
          <Button variant="contained" type="submit" sx={{height: 50}}>
            Sign Up
          </Button>
        </Box>
        <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mt: 4 }}>
          <Link href="./login" underline="hover">
            Looking for login?
          </Link>
        </Typography>

      </Paper>
    </Container>
  );
};

export default Signup;