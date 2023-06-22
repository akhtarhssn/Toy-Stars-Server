const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.a0pfpbg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toyCollection = client.db("toyDb").collection("toys");
    const categoryCollection = client.db("toyDb").collection("category");

    app.get("/toys", async (req, res) => {
      const toys = toyCollection.find();
      const result = await toys.toArray();
      res.send(result);
    });

    app.get("/all-toys", async (req, res) => {
      // const limit = 20; // Specify the limit here
      // const toys = toyCollection.find().limit(limit);
      const toys = toyCollection.find();
      const result = await toys.toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/category", async (req, res) => {
      const category = categoryCollection.find();
      const result = await category.toArray();
      res.send(result);
      console.log(result);
    });

    // user added toys
    app.get("/my-toys", async (req, res) => {
      console.log(req.query);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/add-toy", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);

      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    });

    // UPDATE METHOD
    app.patch("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const updatedToy = req.body;

      console.log(updatedToy);

      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: updatedToy.updatedPrice,
          quantity: updatedToy.updatedQuantity,
          details: updatedToy.updatedDetails,
        },
      };
      const result = await toyCollection.updateOne(query, updateDoc, {
        new: true,
      });
      console.log(result);
      res.send(result);
    });

    // DELETE METHOD
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Kiddie Corner is Running");
});

app.listen(port, () => {
  console.log(`Kiddie Corner Server is running on port ${port}`);
});
