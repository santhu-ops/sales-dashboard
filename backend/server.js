const app = require('./src/app');
const connectDB = require('./src/config/db'); // trigger nodemon reload

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch((err) => {
  console.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});
