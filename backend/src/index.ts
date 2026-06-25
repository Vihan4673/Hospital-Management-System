import dns from "node:dns"
dns.setServers(["8.8.8.8", "8.8.4.4"])
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

const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://hospital-three-theta-34.vercel.app"
        ];

        if (process.env.CLIENT_ORIGIN) {
            allowedOrigins.push(process.env.CLIENT_ORIGIN);
        }

        const isVercelPreview = origin && /\.vercel\.app$/.test(origin);

        if (!origin || allowedOrigins.indexOf(origin) !== -1 || isVercelPreview) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/api/ai", aiRoutes);
app.use("/api", rootRouter);
app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!, Hi Backend is working!");
});

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Backend Server listening on port ${port}`);
    });
});