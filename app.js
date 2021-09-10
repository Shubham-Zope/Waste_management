const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const crypto = require("crypto");
const session = require('express-session');
const multer = require('multer');
var fs = require("fs");
var path = require('path');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(bodyParser.json())
app.use(session({
	secret: 'Your secret key',
	resave: true,
	saveUninitialized: true
}));
var db = mongoose.connect("mongodb://localhost:27017/wastemanagementDB", {useNewUrlParser: true, useUnifiedTopology: true});


const userSchema = {
    username: String,
    pass: String,
    email: String,
    address: String,
    phone: String
};

const sellproductSchema = {
    username: String,
    email: String,
    phone: String,
    img: {
        data: Buffer,
        contentType: String
    },
    name: {
        type: String
    },
    price: String
};

const donateSchema = {
    username: String,
    email: String,
    phone: String,
    img: {
        data: Buffer,
        contentType: String
    },
    name: {
        type: String
    }
};


const User = mongoose.model("User",userSchema);
const Sellproduct = mongoose.model("Sellproduct",sellproductSchema);
const Donate = mongoose.model("Donate",donateSchema);


app.get("/", function(req,res){
	res.render("home");
});

app.get("/login", function(req,res){
	res.render("login");
});

app.get("/signup", function(req,res){
	res.render("signup");
});


app.post("/signup", function(req,res){
    const user = new User({
	    username: req.body.username,
        pass: req.body.pass,
        email: req.body.email,
        address: req.body.addr,
        phone: req.body.phone
	});
	user.save(function(err){
		if(!err){
			console.log("user added");
			res.redirect("/login");
		}
	});
});


app.post("/login", function(req,res){
    console.log(req.body.email);
    console.log(req.body.pass);
    User.exists({email: req.body.email , pass: req.body.pass}, function(err,doc){
        console.log(doc);
		if(err){
			console.log(err);
			console.log("Invalid username or password");
		}
		else{
			if(doc){
				req.session.email = req.body.email;
				req.session.pass = req.body.pass;
				console.log("Success login");
				res.redirect("/dashboard");
			}
			else if(!doc)
			{
				alert("Invalid username or password");
				console.log("Invalid username or password");
				res.redirect("/login");
			}
		}
	});
});

app.get("/sell", function(req,res){
    res.render("sell");
});

app.get("/donate", function(req,res){
    res.render("donate");
});


var storage = multer.diskStorage({
    destination: function(req, file,cb){
        cb(null, 'uploads')
    },
    filename: function(req, file, cb){
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
});
 
var upload = multer({ storage: storage });


app.post("/sell",upload.single('proimg'), function(req,res){    
    let finalimg = {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        contentType: "image/png",
    };

    const sell = new Sellproduct({
	    username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        img: finalimg,
        name: req.body.proname,
        price: req.body.price
	});
	sell.save(function(err){
		if(!err){
			console.log("product added");
			res.redirect("/dashboard");
		}
	});
});


app.post("/donate",upload.single('proimg'), function(req,res){    
    let finalimgs = {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        contentType: "image/png",
    };

    const donate = new Donate({
	    username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        img: finalimgs,
        name: req.body.proname
	});
	donate.save(function(err){
		if(!err){
			console.log("Donation done");
			res.redirect("/dashboard");
		}
	});
});

app.get("/dashboard", function(req,res){
    Sellproduct.find({}, function(err, con){
        res.render("dashboard", {con: con});
    });
});

app.get("/viewdonate", function(req,res){
    Donate.find({}, function(err, con){
        res.render("viewdonate", {con: con});
    });
});


app.listen(3000, function() {
    console.log("Server started on port 3000");
});