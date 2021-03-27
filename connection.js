// Do not change this file
require('dotenv').config({path: "./sample.env"});
const { MongoClient } = require('mongodb');


async function main(callback) {
    const URI = process.env.MONGO_URI
    const client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        
        // Make the appropriate DB calls
        await callback(client);
        

    } catch (e) {
        // Catch any errors
        console.error(e, `URI is: ${MONGO_URI}`);
        throw new Error(`Unable to Connect to Database! here's the error: ${e}`)
    }
}

module.exports = main;