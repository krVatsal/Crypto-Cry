// db/connectDB.js
import { MongoClient, ServerApiVersion } from 'mongodb';

// Use backticks for string interpolation
const uri = "mongodb+srv://test:test@cluster0.mic4h.mongodb.net/coinGeko?retryWrites=true&w=majority&appName=Cluster0"


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const connectDB = async () => {
    try {
        // Connect the client to the server
        await client.connect();
        
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        
        return client;
    } catch (error) {
        console.error("Error connecting to the database:", error.message);
        // Close client if connection fails
        await client.close();
        process.exit(1);
    } finally {
        // Add event listener for application termination
        process.on('SIGINT', async () => {
            await client.close();
            process.exit(0);
        });
    }
}

export { connectDB, client };