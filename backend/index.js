const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// connecting to mysql
const db = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password : '',
    database : 'users_data'
});

db.connect((err)=>{
    if(err){
        console.error("Error in connecting", err);
        return;
    }else{
        console.log("connected to mysql");
    }
});

/// Multer setup for file upload
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

// POST route for form data + file upload
app.post('/api/profile', upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'profilepic', maxCount: 1 },
]), (req, res) => {
  const { fullName, cnic, phone, city } = req.body;
 
  const cnicFront = req.files['cnicFront'][0].filename;
  const cnicBack = req.files['cnicBack'][0].filename;
   const profilepic = req.files['profilepic'][0].filename;

  const sql = `INSERT INTO customers (fullName, cnic, phone, city,  cnicFront, cnicBack, profilepic)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [fullName, cnic, phone, city,  cnicFront, cnicBack, profilepic], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      res.status(500).send('Failed to save data');
    } else {
      res.status(200).send('Data saved successfully');
    }
  });
});

app.listen(5000, () => {
  console.log('Server running at http://localhost:5000');
});


//for workerprofile + verification 
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
    (fullName, cnic, phone, city, skill, available247,  cnicFront, cnicBack,  profilePic, workCert, license) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [fullName, cnic, phone, city, skill, available247,  cnicFront, cnicBack, profilePic, workCert, license], (err, result) => {
    if (err) {
      console.error("Worker insert error:", err);
      return res.status(500).send("Error saving worker data");
    }
    res.send("Worker data saved successfully!");
  });
});
