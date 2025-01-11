import dotenv from "dotenv"
import {connectDB} from "./db/dbConnect.js"
import {app} from './app.js'
import cron from 'node-cron'
dotenv.config({
    path: './.env'
})
import { getCoinsPrice } from "./controllers/crypto.controllers.js"


connectDB()
.then(() => {
    app.listen(process.env.PORT || 5217, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

cron.schedule('* * * * *', async () => {
    console.log('Fetching cryptocurrency prices...');
    await getCoinsPrice();
    console.log('Prices fetched and stored successfully.');
  });

