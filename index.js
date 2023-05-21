const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ohr37qr.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const toysCollection = client.db('toysDB').collection('toys');


        app.get('/toys', async (req, res) => {
            const cursor = toysCollection.find().limit(20);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/toysById/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query)
            res.send(result);
        });

        app.get('/toysByEmail/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = toysCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)

        })


        app.get('/toysBySearch/:searchText', async (req, res) => {
            const searchText = req.params.searchText;
            const result = await toysCollection.find({
                $or: [
                    { name: { $regex: searchText, $options: "i" } },
                    { category: { $regex: searchText, $options: "i" } },],
            }).toArray();
            res.send(result);
        })

        app.put('/toysById/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const toy = req.body;
            const updatedToy = {
                $set: {
                    name: toy.name,
                    sellerName: toy.sellerName,
                    pictureUrl: toy.pictureUrl,
                    rating: toy.rating,
                    price: toy.price,
                    category: toy.category,
                    quantity: toy.quantity,
                    detail: toy.detail
                }
            }
            const result = await toysCollection.updateOne(filter, updatedToy, options)
            res.send(result);
        })

        app.get('/toys/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category: category }
            const cursor = toysCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });


        app.post('/toys', async (req, res) => {
            const newToys = req.body;
            const result = await toysCollection.insertOne(newToys);
            res.send(result);
        })

        app.delete('/toysById/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('toy marketplace server is running')
});

app.listen(port, () => {
    console.log('this server is running on Port' + port)
})