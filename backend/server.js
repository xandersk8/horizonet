require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

const trackerRoutes = require('./routes/tracker');
app.use('/api', trackerRoutes);

app.get('/', (req, res) => {
    res.send('Travel Tracker Backend Running');
});

// Socket.IO logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-trip', (tripId) => {
        socket.join(`trip-${tripId}`);
        console.log(`User joined trip: ${tripId}`);
    });

    socket.on('location-update', (data) => {
        // data: { tripId, latitude, longitude, timestamp }
        io.to(`trip-${data.tripId}`).emit('location-receive', data);
        console.log(`Location update for trip ${data.tripId}:`, data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
