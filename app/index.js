import express from "express"
import { login, checkEmailExists } from './services/authService.js';

const app = express();
const port = process.env.PORT || 8080; // Use process.env.PORT for containerized apps

// Middleware para parsear JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Healthcare Node.js Backend on GKE! Yos");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Endpoint de login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Endpoint para verificar email
app.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await checkEmailExists(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.listen(port, () => {
  console.log(`Node.js backend listening on port ${port}`);
});
