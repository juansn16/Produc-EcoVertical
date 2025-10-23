import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import { createServer } from "http";

import allRoutes from "./routes/allRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// Endpoint de salud
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "API EcoVertical funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});

//Ruta main
app.get("/", (req, res) => {
    res.send('🌱 API Huerto en línea');
});

// Rutas
app.use("/api", allRoutes);

// 404 y errores
app.use(notFound);
app.use(errorHandler);

// Crear servidor HTTP
const server = createServer(app);

export { app, server };
export default app;