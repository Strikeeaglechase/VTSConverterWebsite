import { config } from "dotenv";
import express from "express";

config();

const app = express();
app.use(express.static("public"));

app.listen(process.env.PORT, () => {
	console.log(`Server listening on port ${process.env.PORT}`);
});