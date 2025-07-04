import express from "express";
import { login, register, checkUser } from "./services/authService.js";

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

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    if (result.success) {
      res.status(200).json(result);
    } else {
      if (result.message.includes("Cuenta bloqueada")) {
        res.status(403).json(result);
      } else if (
        result.message.includes("Credenciales inválidas") ||
        result.message.includes("Contraseña inválida")
      ) {
        res.status(401).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error("Error en el controlador de login:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al intentar login." });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, first_name, last_name, phone, birth_date, password } =
      req.body;
    const result = await register({
      email,
      first_name,
      last_name,
      phone,
      birth_date,
      password,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error en el controlador de registro:", error.message);
    if (error.message === "Cuenta ya existente con este correo electrónico.") {
      res.status(409).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Error interno del servidor al intentar registrar." });
    }
  }
});

app.post("/checkUser", async (req, res) => {
  try {
    const email = req.body?.email || req.headers['x-user-email'];
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: "El email es requerido" 
      });
    }

    const result = await checkUser(email);
    res.status(200).json({
      success: true,
      exists: result.exists,
      userId: result.userId
    });
  } catch (error) {
    console.error("Error al verificar usuario:", error);
    res.status(500).json({ 
      success: false,
      error: "Error interno del servidor al verificar usuario",
      message: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Node.js backend listening on port ${port}`);
});
