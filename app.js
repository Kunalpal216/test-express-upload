import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

var corsOptions = {
  origin: "http://158.101.194.135:5173",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.options('*',cors(corsOptions));

app.use(cors(corsOptions));

app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/health", (req, res) => {
  res.json({ success: "true" });
});

app.post("/upload", upload.single("file"), (req, res) => {
  const { buffer, originalname } = req.file;
  console.log(buffer, originalname);
  const writeStream = fs.createWriteStream(path.join(__dirname, "/files/", originalname), { flags: "a" });
  writeStream.write(buffer);
  writeStream.end();

  writeStream.on("finish", () => {
    res.status(200).send("File received successfully.");
  });

  // Event listener for any errors during the write operation
  writeStream.on("error", (err) => {
    console.error(err);
    res.status(500).send("Internal Server Error");
  });
});

app.get("/download/:filePath", (req, res) => {
  console.log(req.params);
  let absolutePath = path.join(__dirname, "/files/", req.params.filePath);
  let fileName = path.basename(absolutePath);
  if(fs.existsSync(absolutePath)) res.download(absolutePath, fileName);
  else res.json({"success" : "false"});
  // const file = fs.readFileSync(path);
  // var stat = fs.statSync(file);
  // res.writeHeader(200, { "Content-Length": stat.size });
  // var fReadStream = fs.createReadStream(file);
  // fReadStream.pipe(res);
  // fReadStream.on("finish", () => {
  //   res.status(200).send("File sent successfully.");
  // });

  // // Event listener for any errors during the write operation
  // fReadStream.on("error", (err) => {
  //   console.error(err);
  //   res.status(500).send("Internal Server Error");
  // });
});

app.listen(3000, () => {
  console.log("Server Started");
});
