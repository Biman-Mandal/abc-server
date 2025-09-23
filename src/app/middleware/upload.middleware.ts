
import multer from "multer";
import path from "path";
import fs from "fs";
import { generateFileName } from "../utils/filename.util";


const createStorage = (uploadType: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.join("uploads", uploadType || "general");

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      cb(null, folderPath);
    },

    filename: (req, file, cb) => {
      const userName = req.body.name || "file";
      const fileName = generateFileName(userName, file.originalname);
      cb(null, fileName);
    },
  });
};


export const uploadSingle = (fieldName: string, uploadType: string) =>
  multer({ storage: createStorage(uploadType) }).single(fieldName);


export const uploadMultiple = (
  fields: { name: string; maxCount?: number }[],
  uploadType: string
) => multer({ storage: createStorage(uploadType) }).fields(fields);