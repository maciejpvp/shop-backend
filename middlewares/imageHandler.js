import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imageHandler = (req, res) => {
  const imageId = req.params.id;
  const imagePath = path.join(__dirname, "../images/items", imageId);

  fs.stat(imagePath, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(404).send("Image not found");
    }

    res.sendFile(imagePath);
  });
};

export default imageHandler;
