const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');


// Setting
app.set('port', process.env.PORT || 3002)



//middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'))
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Routes
app.use('/retencion', require('./routes/retencion'));




//Server online
app.use(bodyParser.json()); 
app.listen(app.get('port'), ()=>{
    console.log("el server esta iniciado en el puerto ", app.get('port'));
});
