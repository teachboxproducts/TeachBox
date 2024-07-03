const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./Database/Connection');

const app = express();
const logger = require('./Middleware/logger');

const port = process.env.NODE_PORT || 3000;
const authRoutes = require('./Controllers/auth/AuthRouter');
const clientRoutes = require('./Controllers/client/ClientRouter');
const clientAdminRoutes = require('./Controllers/clientAdmin/ClientAdminRouter');
const projectRoutes = require('./Controllers/project/ProjectRouter');
const facilitatorsRoutes = require('./Controllers/facilitators/FacilitatorsRouter');

// Middleware to log requests
app.use(express.json()); // Parse JSON request body
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`, { payload: req.body });
  next();
});

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false, parameterLimit: 1000000 }));
app.use(cors()); // Use CORS middleware to allow all origins

// Routes
app.get('/', (req, res) => {
  res.send('API is running');
});
app.use('/auth', authRoutes);
app.use('/client', clientRoutes);
app.use('/client-admin', clientAdminRoutes);
app.use('/project', projectRoutes);
app.use('/facilitator', facilitatorsRoutes);

// Error handling middleware
app.use((err, req, res) => {
  logger.error(err.stack);
  res.status(500).send('Something broke!');

});

// Function to start the server
const startServer = () => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

// Establish database connection and then start the server
pool.getConnection((err, connection) => {
  if (err) {
    console.error(`Error connecting to database: ${err.stack}`);
    process.exit(1); // Exit the process with failure code
  } else {
    console.log(`Connected to database as ID ${connection.threadId}`);
    connection.release();
    startServer(); // Start the server after successful DB connection
  }
});
