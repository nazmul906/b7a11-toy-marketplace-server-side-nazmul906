const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Helen of Toy");
});

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w5hdwnt.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();
    const toysCollection = client.db("toyMarket").collection("alltoys");

    // indexing for search
    const indexkey = { name: 1 }; /*field name..toyfield */
    const indexOption = { name: "toyname" };
    const result = await toysCollection.createIndex(indexkey, indexOption);
    // console.log(result);
    app.get("/searchbytoyname/:text", async (req, res) => {
      const text = req.params.text;
      // console.log(text);
      const result = await toysCollection
        .find({
          $or: [{ name: { $regex: text, $options: "i" } }],
        })
        .toArray();
      // console.log(result);
      res.send(result);
    });

    app.get("/alltoys", async (req, res) => {
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/alltoys/:subcategory", async (req, res) => {
      // console.log(req.params.subcategory);
      const query = { subcategory: req.params.subcategory };
      const sub = await toysCollection.find(query).toArray();
      // console.log(sub);
      res.send(sub);
    });

    app.get("/alltoy", async (req, res) => {
      //  console.log(req.params.email);
      // const query = { email: req.params.email };
      // const result = await toysCollection.find(query).toArray();
      // console.log(result);
      // console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await toysCollection
        .find(query)
        .sort({ price: 1 })
        .toArray();
      // console.log(result);
      res.send(result);
    });

    // single toy
    app.get("/singletoy/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      // const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne({
        _id: new ObjectId(id),
      });
      // console.log(result);
      res.send(result);
    });

    app.post("/addtoy", async (req, res) => {
      // console.log(req.body);
      const body = req.body;
      const result = await toysCollection.insertOne(body);
      res.send(result);
    });

    // update
    // pictureURL: updatetoy.pictureURL,
    //       name: updatetoy.name,
    //       sellerName: updatetoy.sellerName,
    //       subcategory: updatetoy.subcategory,
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      // console.log("update", id);
      const options = { upsert: true };
      const updatetoy = req.body;
      const updateDoc = {
        $set: {
          price: updatetoy.price,
          // rating: updatetoy.rating,
          quantity: updatetoy.quantity,
          description: updatetoy.description,
          // email: updatetoy.email,
        },
      };

      const result = await toysCollection.updateOne(filter, updateDoc, options);

      // console.log(result);
      res.send(result);
    });

    // delete
    app.delete("/singletoy/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
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

app.listen(port, () => {
  console.log(`port is runnig on ${port}`);
});
