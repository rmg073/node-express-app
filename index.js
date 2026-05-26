const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 10000;

// CSS FOLDER
app.use(express.static(path.join(__dirname, "public")));

// HOME PAGE
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>

  <head>
    <title>MOHAN HEALTH AND HOME</title>
    <link rel="stylesheet" href="/style.css">
  </head>

  <body>

    <header>
      <h1>MOHAN HEALTH AND HOME</h1>
      <p>50 Years in the Making</p>
    </header>

    <section class="hero">
      <h1>Welcome to Mohan Health and Home</h1>

      <p>
        Trusted Homeopathic Store for
        Dilutions, Mother Tinctures,
        Biochemic Salts, BC Numbers and R Drops
      </p>

      <a class="whatsapp"
         href="https://wa.me/919837100364">
         Order on WhatsApp
      </a>
    </section>

    <section class="section">

      <div class="card">
        <h2>Dilutions</h2>
        <p>Premium homeopathic dilution medicines.</p>
      </div>

      <div class="card">
        <h2>Mother Tinctures</h2>
        <p>Original mother tinctures available.</p>
      </div>

      <div class="card">
        <h2>Biochemic Salts</h2>
        <p>Complete range of biochemic remedies.</p>
      </div>

      <div class="card">
        <h2>BC Numbers</h2>
        <p>Popular biochemic combinations.</p>
      </div>

      <div class="card">
        <h2>R Drops</h2>
        <p>German remedy drops available.</p>
      </div>

    </section>

    <footer>
      <h3>Mohan Health and Home</h3>
      <p>Homeopathy • Wellness • Trusted Care</p>
    </footer>

  </body>
  </html>
  `);
});

// START SERVER
app.listen(PORT, () => {
  console.log("HTTP server listening on port " + PORT);
});
