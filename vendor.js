const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 8080;

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'password', 
  database: 'vendor', 
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
});

// Create Tables
const createTables = () => {
  const vendorTable = `
    CREATE TABLE IF NOT EXISTS Vendor (
      VendorID INT AUTO_INCREMENT PRIMARY KEY,
      Name VARCHAR(100) NOT NULL,
      ServiceCategories VARCHAR(100),
      ContactInfo VARCHAR(50),
      ComplianceCertifications VARCHAR(100),
      RegistrationDate DATE
    );
  `;

  const contractTable = `
    CREATE TABLE IF NOT EXISTS Contract (
      ContractID INT AUTO_INCREMENT PRIMARY KEY,
      VendorID INT,
      Details TEXT,
      StartDate DATE,
      ExpiryDate DATE,
      Status VARCHAR(50),
      FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID)
    );
  `;

  const purchaseOrderTable = `
    CREATE TABLE IF NOT EXISTS PurchaseOrder (
      PurchaseOrderID INT AUTO_INCREMENT PRIMARY KEY,
      VendorID INT,
      DepartmentID INT,
      Items TEXT,
      TotalCost DECIMAL(10, 2),
      Status VARCHAR(50),
      FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID)
    );
  `;

  const budgetTable = `
    CREATE TABLE IF NOT EXISTS Budget (
      BudgetID INT AUTO_INCREMENT PRIMARY KEY,
      DepartmentID INT,
      TotalAmount DECIMAL(10, 2),
      RemainingAmount DECIMAL(10, 2)
    );
  `;

  const vendorPerformanceTable = `
    CREATE TABLE IF NOT EXISTS VendorPerformance (
      PerformanceID INT AUTO_INCREMENT PRIMARY KEY,
      VendorID INT,
      Metrics TEXT,
      Score DECIMAL(4, 2),
      EvaluationDate DATE,
      FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID)
    );
  `;

  const taskTable = `
    CREATE TABLE IF NOT EXISTS Task (
      TaskID INT AUTO_INCREMENT PRIMARY KEY,
      Description TEXT,
      AssignedTo VARCHAR(100),
      StartDate DATE,
      EndDate DATE,
      Status VARCHAR(50),
      VendorID INT,
      FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID)
    );
  `;

  const auditTable = `
    CREATE TABLE IF NOT EXISTS Audit (
      AuditID INT AUTO_INCREMENT PRIMARY KEY,
      AuditDetails TEXT,
      AuditDate DATE,
      PerformedBy VARCHAR(100),
      VendorID INT,
      FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID)
    );
  `;

  db.query(vendorTable, handleError('Vendor'));
  db.query(contractTable, handleError('Contract'));
  db.query(purchaseOrderTable, handleError('PurchaseOrder'));
  db.query(budgetTable, handleError('Budget'));
  db.query(vendorPerformanceTable, handleError('VendorPerformance'));
  db.query(taskTable, handleError('Task'));
  db.query(auditTable, handleError('Audit'));
};

const handleError = (tableName) => (err) => {
  if (err) console.error(`Error creating ${tableName} table:`, err);
  else console.log(`${tableName} table created successfully!`);
};

// Insert Dummy Data
const insertDummyData = () => {
  const vendorData = [
    ['Vendor A', 'IT Services', '123-456-7890', 'ISO Certified', '2023-05-01'],
    ['Vendor B', 'Office Supplies', '987-654-3210', 'Gov Certified', '2022-11-15'],
  ];
  vendorData.forEach((data) => {
    const query = `
      INSERT INTO Vendor (Name, ServiceCategories, ContactInfo, ComplianceCertifications, RegistrationDate)
      VALUES (?, ?, ?, ?, ?);
    `;
    db.query(query, data, (err) => {
      if (err) console.error('Error inserting Vendor data:', err);
      else console.log('Vendor data inserted successfully!');
    });
  });

  const auditData = `
    INSERT INTO Audit (AuditDetails, AuditDate, PerformedBy, VendorID)
    VALUES 
    ('Quarterly compliance audit', '2023-12-01', 'John Doe', 1),
    ('Annual review', '2024-01-10', 'Jane Smith', 2);
  `;
  db.query(auditData, handleError('Audit data'));

  const taskData = `
    INSERT INTO Task (Description, AssignedTo, StartDate, EndDate, Status, VendorID)
    VALUES 
    ('Software update deployment', 'Alice', '2024-01-01', '2024-01-10', 'Completed', 1),
    ('Office supplies delivery', 'Bob', '2024-02-01', '2024-02-05', 'In Progress', 2);
  `;
  db.query(taskData, handleError('Task data'));
};

// Initialize on Server Start
app.get('/initialize', (req, res) => {
  createTables();
  insertDummyData();
  res.send('Tables created and dummy data inserted!');
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
