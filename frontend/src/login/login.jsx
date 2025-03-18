import { useState } from "react";
import "./login.css";
import { Navigate, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await fetch(`http://localhost:5002/register`, {
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

    <div className="loginContainer">
      <div className="loginBox">
        <h2 className="loginText">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="email"
              className="emailInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              className="passwordInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" className="loginButton">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;