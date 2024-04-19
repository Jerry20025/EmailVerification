const express = require('express');

const cors=require('cors')
const userRouter = require("./user");
const router = express.Router();

const app=express();
app.use(cors());
router.use('/user',userRouter)
module.exports = router;