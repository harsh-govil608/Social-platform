import express from 'express';

const app = express();
const PORT = 5002;

app.get('/test', (req, res) => {
    res.json({ message: 'Test works!' });
});

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});