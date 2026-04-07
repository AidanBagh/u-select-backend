const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.csv', '.xlsx', '.xls', '.pdf', '.doc', '.docx'].includes(ext)) cb(null, true);
  else cb(new Error('Only CSV, Excel, PDF, and Word files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 7 * 1024 * 1024 } });

module.exports = upload;
