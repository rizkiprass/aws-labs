/**
 * Various Ways to Input Email Lists for Bulk Sending
 */

import { SESClient, SendBulkTemplatedEmailCommand } from '@aws-sdk/client-ses';
import fs from 'fs/promises';
import csv from 'csv-parser';
import { createReadStream } from 'fs';

const sesClient = new SESClient({ region: 'us-east-1' });

// ============================================
// 1. HARDCODE - For Testing
// ============================================
async function sendFromHardcode() {
  const recipients = [
    { email: 'user1@gmail.com', name: 'John Doe', amount: '100' },
    { email: 'user2@gmail.com', name: 'Jane Smith', amount: '200' },
    { email: 'user3@gmail.com', name: 'Bob Wilson', amount: '150' }
  ];

  await sendBulkEmail(recipients);
}

// ============================================
// 2. CSV FILE - Most Common
// ============================================
async function sendFromCSV(filePath) {
  const recipients = [];

  return new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // CSV format: email,name,orderId,amount
        recipients.push({
          email: row.email,
          data: {
            name: row.name,
            orderId: row.orderId,
            amount: row.amount
          }
        });
      })
      .on('end', async () => {
        console.log(`Loaded ${recipients.length} recipients from CSV`);
        await sendBulkEmail(recipients);
        resolve();
      })
      .on('error', reject);
  });
}

// ============================================
// 3. JSON FILE
// ============================================
async function sendFromJSON(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  const recipients = JSON.parse(data);
  
  console.log(`Loaded ${recipients.length} recipients from JSON`);
  await sendBulkEmail(recipients);
}

// ============================================
// 4. TEXT FILE (one email per line)
// ============================================
async function sendFromTextFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const emails = content.split('\n').filter(line => line.trim());
  
  const recipients = emails.map(email => ({
    email: email.trim(),
    data: { name: email.split('@')[0] } // Default name from email
  }));

  console.log(`Loaded ${recipients.length} recipients from text file`);
  await sendBulkEmail(recipients);
}

// ============================================
// 5. DATABASE (MySQL/PostgreSQL)
// ============================================
async function sendFromDatabase() {
  // Example with MySQL
  const mysql = require('mysql2/promise');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'myapp'
  });

  const [rows] = await connection.execute(`
    SELECT email, name, order_id, amount 
    FROM customers 
    WHERE subscribed = 1
  `);

  const recipients = rows.map(row => ({
    email: row.email,
    data: {
      name: row.name,
      orderId: row.order_id,
      amount: row.amount
    }
  }));

  console.log(`Loaded ${recipients.length} recipients from database`);
  await sendBulkEmail(recipients);
  await connection.end();
}

// ============================================
// 6. API ENDPOINT (for web app)
// ============================================
import express from 'express';
const app = express();
app.use(express.json());

app.post('/send-bulk-email', async (req, res) => {
  try {
    const { recipients, templateName } = req.body;
    
    // recipients format:
    // [
    //   { email: "user@test.com", data: { name: "John", ... } },
    //   ...
    // ]

    const result = await sendBulkEmail(recipients, templateName);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 7. GOOGLE SHEETS (via API)
// ============================================
async function sendFromGoogleSheets() {
  const { google } = require('googleapis');
  
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: 'YOUR_SHEET_ID',
    range: 'Sheet1!A2:D', // Skip header row
  });

  const rows = response.data.values;
  const recipients = rows.map(row => ({
    email: row[0],
    data: {
      name: row[1],
      orderId: row[2],
      amount: row[3]
    }
  }));

  console.log(`Loaded ${recipients.length} recipients from Google Sheets`);
  await sendBulkEmail(recipients);
}

// ============================================
// 8. EXCEL FILE (.xlsx)
// ============================================
async function sendFromExcel(filePath) {
  const XLSX = require('xlsx');
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  const recipients = data.map(row => ({
    email: row.email,
    data: {
      name: row.name,
      orderId: row.orderId,
      amount: row.amount
    }
  }));

  console.log(`Loaded ${recipients.length} recipients from Excel`);
  await sendBulkEmail(recipients);
}

// ============================================
// 9. FORM UPLOAD (Web Interface)
// ============================================
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

app.post('/upload-and-send', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    let recipients;
    
    if (fileType === 'text/csv') {
      recipients = await parseCSV(filePath);
    } else if (fileType === 'application/json') {
      const data = await fs.readFile(filePath, 'utf-8');
      recipients = JSON.parse(data);
    } else if (fileType.includes('spreadsheet')) {
      recipients = await parseExcel(filePath);
    }

    await sendBulkEmail(recipients);
    
    // Cleanup
    await fs.unlink(filePath);
    
    res.json({ success: true, sent: recipients.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Helper: Send Bulk Email Function
// ============================================
async function sendBulkEmail(recipients, templateName = 'DefaultTemplate') {
  const BATCH_SIZE = 50;
  const results = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    
    const params = {
      Source: 'noreply@abc.com',
      Template: templateName,
      DefaultTemplateData: JSON.stringify({
        company: 'ABC Corp',
        year: new Date().getFullYear()
      }),
      Destinations: batch.map(recipient => ({
        Destination: { ToAddresses: [recipient.email] },
        ReplacementTemplateData: JSON.stringify(recipient.data || {})
      }))
    };

    const command = new SendBulkTemplatedEmailCommand(params);
    const response = await sesClient.send(command);
    results.push(response);
    
    console.log(`Sent batch ${Math.floor(i / BATCH_SIZE) + 1}`);
    
    // Rate limiting
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return results;
}

// ============================================
// Helper: Parse CSV
// ============================================
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const recipients = [];
    createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => recipients.push({
        email: row.email,
        data: { ...row }
      }))
      .on('end', () => resolve(recipients))
      .on('error', reject);
  });
}

// ============================================
// Example Usage
// ============================================
async function main() {
  // Choose one:
  
  // await sendFromHardcode();
  // await sendFromCSV('emails.csv');
  // await sendFromJSON('emails.json');
  // await sendFromTextFile('emails.txt');
  // await sendFromDatabase();
  // await sendFromGoogleSheets();
  // await sendFromExcel('emails.xlsx');
}

export {
  sendFromHardcode,
  sendFromCSV,
  sendFromJSON,
  sendFromTextFile,
  sendFromDatabase,
  sendFromGoogleSheets,
  sendFromExcel
};
