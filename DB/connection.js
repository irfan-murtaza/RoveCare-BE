//Database Connection

const mongoose = require("mongoose");

const connectionString =
  "mongodb+srv://aadil:starshipeleven@cluster0.0p0ih.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

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
