import express, { Request, Response } from "express"
import { connectDB } from "./db/mongo"
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorhandler";
import rootRouter from "./routes/index.route";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config()
const app = express()

const port = 3000

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

const corsOptions = {
  origin: CLIENT_ORIGIN,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));


app.use(cookieParser())
app.use(express.json());
app.use("/api", rootRouter)
app.use(errorHandler)

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!, Hi")
})

connectDB().then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })
  })
  
