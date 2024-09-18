const express = require('express');
const app =  express();
const PORT =    8001;
const URL = require('./models/url');
const path = require('path');
const cookieParser = require('cookie-parser')
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRoute');
const userRoute = require("./routes/user");
const {connectToMongoDB} = require('./connect');
const {checkForAuthentication ,restrictTo} =require('./middlewares/auth')

// Example usage:
const mongoURL = 'mongodb://127.0.0.1:27017/shorturl'; // Update with your MongoDB URL
connectToMongoDB(mongoURL);

app.set('view engine', "ejs");  //to which view is used like handlebar, ejs,pug
app.set('views', path.resolve("./views")) // which folder contain the view files

app.use(express.json())   //to support the json view
app.use(express.urlencoded({extended:false}))  // accept the form also
app.use(cookieParser());
app.use(checkForAuthentication);



app.use('/url',restrictTo(['NORMAL','ADMIN']),urlRoute);
app.use('/' ,staticRoute);
app.use('/user',userRoute);



app.get('/url/:shortId', async (req,res) =>{
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId,
    },{
        $push: {
            visitHistory :{
                timestamp : Date.now()
            }
        },
    });
    res.redirect(entry?.redirectUrl);
});
app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));