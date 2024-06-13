require("dotenv").config();
const express = require("express");
const { connectClient, closeConnection, fetchAll, addFile, addFolder, addUser, loginUser } = require("../js/db");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");

const app = express();

const secret = crypto.randomBytes(64).toString("hex");

const jsonEncodedParser = bodyParser.json();
const urlEncodedParser = bodyParser.urlencoded({extended:false});
const upload = multer({ dest: 'api/add-file/' });

connectClient();

app.use(express.static(path.join(__dirname,"../public")));

app.use(session({
    secret:secret,
    saveUninitialized: false,
    resave: false,
    cookie:{maxAge:86400000}
}));

app.get("/api/check-login",(req,res)=>{
    if(req.session&&req.session.token){
        res.status(200).send({msg:"Logged In"});
    }
    else
        res.status(204).send({msg:"Please Login"});
});

app.post("/api/register",jsonEncodedParser,async (req,res)=>{
    const response = await addUser(req.body);
    if(response===409){
        res.status(409).send({msg:"User Already Exists"});
    }
    else if(response === 500){
        res.status(500).send({msg:"Internal Server Error"});
    }
    else if(response === 200){
        res.status(200).send({msg:"User added successfully"});
    }
    else
        res.status(400);
});

app.post("/api/login",jsonEncodedParser,async (req,res)=>{
    const response = await loginUser(req.body);
    if(response===404){
        res.status(404).send({msg:"Invalid Credentials"});
    }
    else if(response === 500){
        res.status(500).send({msg:"Internal Server Error"});
    }
    else if(response === 200){
        const token = jwt.sign({email:req.body.email,login:true},secret);
        req.session.token = token;
        res.status(200).send({token:token});
    }
    else
        res.status(400);
});

app.get("/api/logout",(req,res)=>{
    req.session = null;
    res.status(200).send({msg:"Logout Successful"});
});

app.get("/api/get-files",async (req,res)=>{
    const bearerToken = req.headers.authorization;
    if(bearerToken){
        const token = bearerToken.split(" ")[1];
        if(token===req.session.token){
            const email = jwt.decode(token);
            let items = await fetchAll(email.email);
            if(items)
                res.status(200).send([items]);
            else
                res.status(404).send({msg:"Not Found"});
        }
        else{
            res.status(401).send({msg:"Unauthorized"});
        }
    }
    else
        res.status(401).send({msg:"Unauthorized"});
});

app.post("/api/add-folder",jsonEncodedParser, async (req,res)=>{
    const bearerToken = req.headers.authorization;
    if(bearerToken){
        const token = bearerToken.split(" ")[1];
        if(token===req.session.token){
            const email = jwt.decode(token);
            const response = await addFolder(email.email,req.body.path,req.body.name);
            if(response===200)
                res.status(200).send({msg:"successful"});
            else
                res.status(500).send({msg:"Server Error"});
        }
        else{
            res.status(401).send({msg:"Unauthorized"});
        }
    }
    else
        res.status(401).send({msg:"Unauthorized"});
});

app.post("/api/add-file", upload.single("file"), async (req,res)=>{
    const bearerToken = req.headers.authorization;
    if(bearerToken){
        const token = bearerToken.split(" ")[1];
        if(token===req.session.token){
            if(req.file){
                if(req.file.size>15728640){
                    res.status(413).send({msg:"File is too large"});
                }
                else{
                    // Read the uploaded file
                    const imageData = fs.readFileSync(req.file.path);
                    const encodedImage = imageData.toString('base64');

                    const email = jwt.decode(token);
                    const response = await addFile(email.email,req.body.path,req.file.originalname,req.file.mimetype,encodedImage);
                    if(response===200)
                        res.status(200).send({msg:"successful"});
                    else
                        res.status(500).send({msg:"Server Error"});
                }
            }
            else{
                res.status(400).send({msg:"File Upload Failed"});
            }
        }
        else{
            res.status(401).send({msg:"Unauthorized"});
        }
    }
    else
        res.status(401).send({msg:"Unauthorized"});
});

app.get('*',(req,res)=>{
    res.sendFile('index.html', { root: path.join(__dirname, '../public') });
  });

app.listen(5000,()=>{
    console.log("App listening on port 5000");
});

app.on("close",()=>{
    closeConnection();
});