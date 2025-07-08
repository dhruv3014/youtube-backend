import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDb connected  !! DB HOST: ${connectionInstance.connection.host}`)  // here print 'host' because since databases are different for production, development, testing, etc so we need to check if we are connected to any other database or not.
        // console.log(connectionInstance);
        
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1) //In Node.js, the `process` object is a global that provides information about, and control over, the current Node.js process
    }
}

export default connectDB