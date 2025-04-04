import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Box, Button, Container, TextField, Paper, Typography, Link } from "@mui/material"
import ReactLogo from "../assets/react.svg"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // function called on login
  const handleLogin = async (e) => {

    // prevent things like no password, no username etc.
    e.preventDefault();

    try {

      // Call login on backend
      const res = await fetch(`http://localhost:5002/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      // Check if login was successful
      if (res.ok) {
        alert("Called login")

        // Redirect to homepage
        navigate("/dashboard");
      } else {
        alert('Login failed')
      }
    } catch (err) {
      console.error(err)
      alert('Something went wrong')
    }
  };

  return (

    // container for page
    <Container maxWidth="xs" sx={{ bgcolor: "white", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, width: "100%", height: 415 }}>

        {/* logo for login page */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
          <img src={ReactLogo} alt="React Logo" width={60} />
        </Box>

        {/* form for login credentials */}
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
          <TextField value={email} onChange={(e) => setEmail(e.target.value)} variant="outlined" label="Enter email" fullWidth  sx={{height: 50}}/>
          <TextField value={password} onChange={(e) => setPassword(e.target.value)} variant="outlined" label="Enter password" type="password" fullWidth sx={{height: 50}} />
          <Button variant="contained" type="submit" sx={{height: 50}}>
            Login
          </Button>
        </Box>

        {/* forgot password / signup link */}
        <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mt: 4 }}>
          <Link href="#" underline="hover">
            Forgot Password?
          </Link>{" "}
          |{" "}
          <Link href="./signup" underline="hover">
            Sign Up
          </Link>
        </Typography>

      </Paper>
    </Container>
  );
};

export default Login;