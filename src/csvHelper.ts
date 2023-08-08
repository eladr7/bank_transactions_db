import csvParser from "csv-parser";
import fs from "fs";
import { Transform } from "stream";

export const getCSVLines = (filePath: string): Transform => {
  const fileStream = fs.createReadStream(filePath);
  const parserStream = fileStream.pipe(
    csvParser({
      mapHeaders: ({ header }) =>
        header.trim().replace(/\s+/g, "_").toLowerCase(),
    })
  );

  return parserStream;
};
