const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const safeName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB per file
});

app.post('/upload', upload.array('files', 20), (req, res) => {
  const files = req.files.map(f => ({
    original: f.originalname,
    stored: f.filename,
    url: `/files/${f.filename}`
  }));

  res.json({
    success: true,
    files
  });
});

app.use('/files', express.static(uploadDir));

app.get('/', (_, res) => {
  res.send('RSC Upload Server is running');
});

app.listen(PORT, () => {
  console.log(`Upload server running on port ${PORT}`);
});
