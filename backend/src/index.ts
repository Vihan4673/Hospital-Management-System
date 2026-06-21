import express, { Request, Response } from "express";
import { connectDB } from "./db/mongo";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorhandler";
import rootRouter from "./routes/index.route";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

// 1. FIX: Port එක 5000 කරන්න (Frontend එක 3000 නිසා)
const port = process.env.PORT || 5000;

// 2. FIX: .env එකේ CLIENT_ORIGIN=http://localhost:3000 කියලා තියෙන්න ඕනේ
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

const corsOptions = {
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/api", rootRouter);
app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!, Hi Backend is working!");
});

connectDB().then(() => {
    app.listen(port, () => {
        // 3. FIX: මෙතන port එක නිවැරදිව ප්‍රින්ට් වෙන්න සකසන්න
        console.log(`Backend Server listening on port ${port}`);
    });
});