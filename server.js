const app = require('./app');
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await app.listen(PORT);
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      const newPort = PORT + 1;
      console.log(`Port ${PORT} is in use, trying port ${newPort}...`);
      try {
        await app.listen(newPort);
        console.log(`Server running on port ${newPort}`);
      } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    } else {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
};

startServer();