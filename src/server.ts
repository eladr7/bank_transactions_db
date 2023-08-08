import express from "express";
import multer from "multer";
import fs from "fs";
import { BankTransactionsDB } from "./BankTransactionsDB";
import { getCSVLines } from "./csvHelper";
import { Transform } from "stream";

const database = new BankTransactionsDB();

const app = express();

const upload = multer({ dest: "uploads/" });
app.post("/uploadFile", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const filePath: string = req.file.path;
  const csvLines: Transform = getCSVLines(filePath);

  const bankTransactions = await database.insertCSVLinesIntoDB(csvLines);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting temporary file:", err);
    }
  });

  res.json({
    message: "File uploaded successfully.",
    transactions: bankTransactions,
  });
});

app.get("/getTransactions", async (_, res) => {
  try {
    const rows = await database.getTransactions();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching transactions." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
