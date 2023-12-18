//Database Connection

const mongoose = require("mongoose");

const connectionString =
  "xxxx";

const connectToMongoDB = () => {
  mongoose.connect(
    connectionString,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      console.log("Connection Successfull");
    }
  );
};
connectToMongoDB();
