import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const { Pool } = pg;
app.use(express.json());

// Crear una nueva conexión a la base de datos utilizando Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Verificar la conexión a la base de datos
pool
  .connect()
  .then(() => console.log("Conexión exitosa a la base de datos"))
  .catch((err) => console.error("Error al conectar a la base de datos:", err));

// Ruta básica
app.get("/", (req, res) => {
  res.send("Welcome to this Node.js PostgreSQL lesson!");
});

// Tarea 1: Enumerar todos los jugadores y sus puntuaciones
app.get("/players-scores", async (req, res) => {
  const query = `
    SELECT players.name AS player_name, games.title AS game_title, scores.score
    FROM players
    JOIN scores ON players.id = scores.player_id
    JOIN games ON scores.game_id = games.id;
  `;

  try {
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tarea 2: Encontrar los mejores jugadores
app.get("/top-players", async (req, res) => {
  const query = `
    SELECT players.name AS player_name, SUM(scores.score) AS total_score
    FROM players
    JOIN scores ON players.id = scores.player_id
    GROUP BY players.id
    ORDER BY total_score DESC
    LIMIT 3;
  `;

  try {
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tarea 3: Jugadores que no han jugado ningún juego
app.get("/inactive-players", async (req, res) => {
  const query = `
    SELECT players.name
    FROM players
    LEFT JOIN scores ON players.id = scores.player_id
    WHERE scores.player_id IS NULL;
  `;

  try {
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tarea 4: Buscar géneros de juegos populares
app.get("/popular-genres", async (req, res) => {
  const query = `
    SELECT games.genre, COUNT(*) AS play_count
    FROM games
    JOIN scores ON games.id = scores.game_id
    GROUP BY games.genre
    ORDER BY play_count DESC;
  `;

  try {
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tarea 5: Jugadores que se unieron recientemente
app.get("/recent-players", async (req, res) => {
  const query = `
    SELECT name
    FROM players
    WHERE join_date > NOW() - INTERVAL '30 days';
  `;

  try {
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});
