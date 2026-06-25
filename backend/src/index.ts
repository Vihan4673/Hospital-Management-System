import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express, { Request, Response } from "express";
import { connectDB } from "./db/mongo";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorhandler";
import rootRouter from "./routes/index.route";
import cors from "cors";
import cookieParser from "cookie-parser";
import aiRoutes from "./routes/AiRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
    "http://localhost:3000",
    process.env.CLIENT_ORIGIN
].filter(Boolean) as string[];

const corsOptions = {
    origin: function (origin: any, callback: any) {
        // allow server-to-server or mobile apps (no origin)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            return callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

// routes
app.use("/api/ai", aiRoutes);
app.use("/api", rootRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Backend is working 🚀");
});

app.use(errorHandler);


connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Backend Server running on port ${port}`);
        console.log("Allowed Origins:", allowedOrigins);
    });
});