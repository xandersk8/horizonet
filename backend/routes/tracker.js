const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Middleware to check auth (simple token header for now, 
// in real scenario would use supabase.auth.getUser(token))
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

    req.user = user;
    next();
};

// Start a trip
router.post('/trips', authenticate, async (req, res) => {
    const { data, error } = await supabase
        .from('viagens')
        .insert([{ user_id: req.user.id }])
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
});

// Finish a trip
router.patch('/trips/:id/finish', authenticate, async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('viagens')
        .update({ data_fim: new Date().toISOString(), status: 'concluida' })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
});

// Post location points (batch or single)
router.post('/locations', authenticate, async (req, res) => {
    const { tripId, locations } = req.body; // locations: [{latitude, longitude, timestamp}, ...]

    // Verify trip ownership
    const { data: trip } = await supabase
        .from('viagens')
        .select('id')
        .eq('id', tripId)
        .eq('user_id', req.user.id)
        .single();

    if (!trip) return res.status(403).json({ error: 'Access denied' });

    const pointsToInsert = locations.map(loc => ({
        viagem_id: tripId,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: loc.timestamp
    }));

    const { error } = await supabase
        .from('localizacoes')
        .insert(pointsToInsert);

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ success: true });
});

module.exports = router;
