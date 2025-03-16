import React from "react";

export default function NotFound() {
  return (
    <>
      <style>
        {`
          /* Ganzer Hintergrund in Schwarz */
          .notfound-page {
            width: 100%;
            height: 100vh;
            background: #000;
            margin: 0;
            padding: 0;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-family: sans-serif;
            position: relative;
          }

          /* Letterbox-Bereich (21:9) */
          .notfound-cinematic {
            /* Fixes Seitenverhältnis von 21:9 */
            width: 100vw; 
            height: calc(100vw * (9/21)); 
            max-height: 100vh; /* Nicht über die Bildschirmhöhe hinaus */
            margin: 0 auto;
            position: relative;
            overflow: hidden;
            border-top: 0.5rem solid #000;  /* Schwarze Balken oben + unten */
            border-bottom: 0.5rem solid #000;
          }

          /* Sterne-Hintergrund (scrollt langsam nach unten) */
          .notfound-stars {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: #000 
              url("https://www.transparenttextures.com/patterns/stardust.png")
              repeat;
            background-size: cover;
            animation: starrySky 60s linear infinite;
            z-index: 0;
          }
          @keyframes starrySky {
            0% { background-position: 0 0; }
            100% { background-position: 0 2000px; }
          }

          /* Inhalt => 404-Fehler + Text + Button */
          .notfound-content {
            position: relative;
            z-index: 1;
            text-align: center;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .notfound-title {
            font-size: 8rem;
            margin: 0;
            animation: glitch 1.5s infinite;
            font-weight: 900;
            line-height: 1;
            letter-spacing: -3px;
          }
          @keyframes glitch {
            0% {
              text-shadow: 1px 0 red, -1px 0 blue;
              transform: translate(0, 0);
            }
            20% {
              text-shadow: -2px 0 red, 2px 0 blue;
              transform: translate(-2px, 2px);
            }
            40% {
              text-shadow: 2px 0 red, -2px 0 blue;
              transform: translate(2px, -2px);
            }
            60% {
              text-shadow: -1px 0 red, 1px 0 blue;
              transform: translate(-1px, 1px);
            }
            80% {
              text-shadow: 1px 0 red, -1px 0 blue;
              transform: translate(1px, -1px);
            }
            100% {
              text-shadow: 1px 0 red, -1px 0 blue;
              transform: translate(0, 0);
            }
          }

          .notfound-subtitle {
            font-size: 1.6rem;
            margin: 0.75rem 0;
          }

          .notfound-text {
            font-size: 1rem;
            margin-bottom: 1rem;
            max-width: 600px;
            opacity: 0.9;
          }

          /* Button => Zurück zum Dashboard */
          .notfound-button {
            text-decoration: none;
            background: #ff5050;
            color: #fff;
            padding: 0.7rem 1.2rem;
            border-radius: 6px;
            font-weight: bold;
            transition: background 0.3s, transform 0.2s;
          }
          .notfound-button:hover {
            background: #ff8a8a;
            transform: scale(1.05);
          }

          /* Kleiner orbitierender Planet als Deko */
          .planet-orbit {
            position: absolute;
            width: 180px;
            height: 180px;
            border: 2px dashed #888;
            border-radius: 50%;
            animation: orbit 6s linear infinite;
            top: 10%;
            left: 20%;
            opacity: 0.3;
          }
          .planet {
            position: absolute;
            width: 30px;
            height: 30px;
            background: #ff5050;
            border-radius: 50%;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
          }
          @keyframes orbit {
            0% { transform: translateX(-50%) rotate(0deg); }
            100% { transform: translateX(-50%) rotate(360deg); }
          }
        `}
      </style>

      {/* Gesamter Screen */}
      <div className="notfound-page">
        {/* Bereich im 21:9 Format */}
        <div className="notfound-cinematic">
          {/* Animierte Sterne */}
          <div className="notfound-stars" />

          {/* Orbit & Planet (Deko) */}
          <div className="planet-orbit">
            <div className="planet"></div>
          </div>

          {/* Text-Inhalt */}
          <div className="notfound-content">
            <h1 className="notfound-title">404</h1>
            <h2 className="notfound-subtitle">Oops! Du hast dich wohl verlaufen …</h2>
            <p className="notfound-text">
              Hier draussen im Weltall unserer Productivity-App gibt’s leider nichts zu sehen.
              Am besten kehrst du sofort wieder ins sichere Dashboard zurück,
              bevor du in ein schwarzes Loch fällst!
            </p>
            <a className="notfound-button" href="/dashboard">
              Zurück zum Dashboard
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
