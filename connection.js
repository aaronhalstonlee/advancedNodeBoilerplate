// Do not change this file
const dotenv = require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main(callback) {
    const URI = process.env.MONGO_URI//'mongodb+srv://aaronhalstonlee:Sassdad1@cluster0.vuh29.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'//process.env.MONGO_URI; // Declare MONGO_URI in your .env file
    //console.log("mongo connection URI++++++++++++", `${__dirname}/../../sample.env`);
    const client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        await callback(client);

    } catch (e) {
        // Catch any errors
        console.error(e, `URI is: ${URI}`);
        throw new Error(`Unable to Connect to Database! here's the error: ${e}`)
    }
}

module.exports = main;