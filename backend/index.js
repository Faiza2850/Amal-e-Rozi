const express = require('express'); 
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // static file serving

// ================= MySQL Connection =================
const db = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password : '',
    database : 'users_data'
});

db.connect((err)=>{
    if(err){
        console.error("❌ Error in connecting:", err);
        return;
    } else {
        console.log("✅ Connected to MySQL");
    }
});

// ================= Multer Setup =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage: storage });

// ================== Customer Registration ==================
app.post('/api/profile', upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'profilepic', maxCount: 1 },
]), (req, res) => {
  const { fullName, cnic, phone, city } = req.body;
  const cnicFront = req.files['cnicFront']?.[0]?.filename || null;
  const cnicBack = req.files['cnicBack']?.[0]?.filename || null;
  const profilepic = req.files['profilepic']?.[0]?.filename || null;

  const sql = `INSERT INTO customers (fullName, cnic, phone, city, cnicFront, cnicBack, profilepic)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [fullName, cnic, phone, city, cnicFront, cnicBack, profilepic], (err, result) => {
    if (err) {
      console.error('❌ Insert error:', err);
      res.status(500).send('Failed to save data');
    } else {
      res.status(200).json({ message: '✅ Customer data saved', id: result.insertId });
    }
  });
});

// ================== Worker Registration ==================
app.post('/api/worker', upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'profilePic', maxCount: 1 },
  { name: 'workCert', maxCount: 1 },
  { name: 'license', maxCount: 1 }
]), (req, res) => {
  const { fullName, cnic, phone, city, skill, available247 } = req.body;
  const files = req.files || {};

  const cnicFront = files['cnicFront']?.[0]?.filename || null;
  const cnicBack = files['cnicBack']?.[0]?.filename || null;
  const profilePic = files['profilePic']?.[0]?.filename || null;
  const workCert = files['workCert']?.[0]?.filename || null;
  const license = files['license']?.[0]?.filename || null;

  const sql = `
    INSERT INTO workers 
    (fullName, cnic, phone, city, skill, available247, cnicFront, cnicBack, profilePic, workCert, license) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [fullName, cnic, phone, city, skill, available247, cnicFront, cnicBack, profilePic, workCert, license], (err, result) => {
    if (err) {
      console.error("❌ Worker insert error:", err);
      return res.status(500).send("Error saving worker data");
    }
    res.status(200).json({ message: "✅ Worker data saved successfully!", id: result.insertId });
  });
});

// ================== Worker Profile Fetch ==================
// GET worker profile by ID
app.get('/api/profile/:id', (req, res) => {
  const workerId = req.params.id;

  const sql = "SELECT * FROM workers WHERE id = ?";
  db.query(sql, [workerId], (err, result) => {
    if (err) return res.status(500).send("Server error");
    if (result.length === 0) return res.status(404).json({ message: "Worker not found" });
    res.json(result[0]); 
  });
});


// ================== Default Route ==================
app.get("/", (req, res) => {
  res.send("🚀 Amal-e-Rozi API is running...");
});

// ================== Start Server ==================
app.listen(5000, () => {
  console.log('🚀 Server running at http://localhost:5000');
});
