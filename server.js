const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const DrawnFeature = require('./DrawnFeatures');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./'));

// mongodb connection
mongoose.connect('mongodb://localhost:27017/leafletDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('connected to Mongodb');
}).catch(err => {
    console.log('failed to connect to mongoDB', err);
});

// unnecessary function since we are not using featureid anymore
function generateFeatureId(feature) {
    const geometryString = JSON.stringify({
        type: feature.geometry.type,
        coordinates: feature.geometry.coordinates
    });

    const featureId = crypto.createHash('md5').update(geometryString).digest('hex');
    console.log("generated feature ID:", featureId);
    return featureId;
}


// api routes
app.post('/api/save-feature', async (req, res) => {
    try {
        const feature = req.body;

        // check if same feature already exist, since we dont want duplicates
        const existingFeature = await DrawnFeature.findOne({
            "geometry.type": feature.geometry.type,
            "geometry.coordinates": feature.geometry.coordinates
        });

        if (existingFeature) {
            console.log("feature already exists, skipping save.");
            return res.status(200).json({ message: "feature already exists, skipping duplicate save." });
        }

        // add timestamp to properties
        if (!feature.properties) {
            feature.properties = {};
        }
        feature.properties.timestamp = new Date();

        // generate and assign featureId, delete this
        //feature.featureId = generateFeatureId(feature);

        // save the new feature using drawnfeature
        const newFeature = new DrawnFeature(feature);
        await newFeature.save();

        console.log("feature saved:", newFeature);
        res.status(201).json({ message: "feature saved! :)", feature: newFeature });

    } catch (err) {
        console.error("error saving feature:", err);
        res.status(400).json({ error: err.message });
    }
});


app.get('/api/get-features', async (req, res) => {
    try {
        const features = await DrawnFeature.find().sort({ 'properties.timestamp': -1 });
        res.status(200).send(features);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// get the confirmation that the server is running
app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`);
});
