import { useState } from "react";
import "./topbar.css";
import { Navigate, useNavigate } from "react-router-dom";
import { Box, Button, Container, TextField, Paper, Typography, Link } from "@mui/material";

function TopBar() {
  
  return (
  
    // container for page
    <Container maxWidth="xs" sx={{ bgcolor: "white", top: 0, left: 0, right: 0, zIndex: 1000, width: "100vw", ml: 0 }}>
        <Box elevation={3} sx={{ padding: 0, borderRadius: 0, width: "100vw", height: 50 }}>
        {/* Your navigation elements here */}
        </Box>
    </Container>
  );
}

export default TopBar;
