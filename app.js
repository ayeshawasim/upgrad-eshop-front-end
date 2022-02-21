const config = require("config");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require('./index');



// Connecting to the database
const dbHost = config.get('db.host');
const dbPort = config.get('db.port');
const dbName = config.get('db.name');
mongoose.connect(`mongodb://${dbHost}:${dbPort}/${dbName}`,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => {
  console.log("Successfully connected to MongoDB.");
})
.catch(err => {
  console.error("Connection error", err);
  process.exit();
});


const app = express();

const corsOptions = {
  exposedHeaders: ["x-auth-token", "Authorization"],
};

app.use(cors(corsOptions));

app.use(cors());
app.use(express.json());

app.use('/', routes);

app.listen(8080, () => console.log("Server listening on port 8080 ....."));
