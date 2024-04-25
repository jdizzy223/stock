const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection URI and client setup with MongoDB Atlas
const uri = "mongodb+srv://jdizzy:jd123@stock.b51gsvh.mongodb.net/?retryWrites=true&w=majority&appName=Stock";
const client = new MongoClient(uri, {
    serverApi: ServerApiVersion.v1  // Use the stable API
});

app.use(express.urlencoded({ extended: true }));

// Serve the home page from the views folder
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

// Process the form data and interact with MongoDB
app.get('/process', async (req, res) => {
    try {
        await client.connect();  // Connect to MongoDB using the new settings
        const database = client.db('Stock');  // Specify the database name
        const collection = database.collection('PublicCompanies');  // Specify the collection name

        const searchType = req.query.searchType;
        const searchText = req.query.searchText;

        let query = {};
        if (searchType === "ticker") {
            query = { ticker: searchText.toUpperCase() };
        } else {
            query = { name: new RegExp(searchText, 'i') };
        }

        const companies = await collection.find(query).toArray();

        // Sending response to console and as HTML
        console.log("Search Results:", companies);
        res.send(companies.map(company => `${company.name} (${company.ticker}): $${company.latest_price}`).join('<br>'));
    } catch (e) {
        console.error('Failed to process search:', e);
        res.send("Error processing your search.");
    } finally {
        await client.close();  // Ensure the MongoDB connection is closed after operations
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

