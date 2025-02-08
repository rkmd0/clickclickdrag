// DrawnFeature.js
const mongoose = require('mongoose');

// const drawnFeatureSchema = new mongoose.Schema({
//     featureId: { 
//         type: String, 
//         required: true, 
//         unique: true 
//     },
//     type: String,
//     geometry: {
//         type: { type: String },
//         coordinates: mongoose.Schema.Types.Mixed
//     },
//     properties: {
//         name: String,
//         timestamp: Date
//     }
// });

const drawnFeatureSchema = new mongoose.Schema({
    // REMOVE featureId
    type: String,
    geometry: {
        type: { type: String },
        coordinates: mongoose.Schema.Types.Mixed
    },
    properties: {
        name: String,
        timestamp: Date
    }
});


module.exports = mongoose.model('DrawnFeature', drawnFeatureSchema, 'drawnfeatures');

