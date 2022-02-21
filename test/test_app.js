let port = 8080;
let express = require('express');
let app = express();
let mongoose = require('mongoose');
let morgan = require('morgan');
let config = require('config'); 
const cors = require("cors");
const routes = require('../index');


//db connection
mongoose.connect(config.DBHost,{
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

//not showing the log when it is test
if(config.util.getEnv('NODE_ENV') !== 'test') {
    //use morgan to log at command line
    app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}

const corsOptions = {
  exposedHeaders: ["x-auth-token", "Authorization"],
};

app.use(cors(corsOptions));
app.use(cors());

//parse application/json and look for raw text
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/', routes);

app.listen(port);
console.log("Listening on port " + port);

module.exports = app; // for testing