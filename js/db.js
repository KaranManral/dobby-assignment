const {MongoClient,ServerApiVersion} = require("mongodb");

const client = new MongoClient(process.env.MONGO_URL,
    {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
        }
    }
)

// const db = client.db("dobby-drive");
const db = client.db("dobby");

const connectClient = async () => {
    try{
        await client.connect();
    }
    catch(err){
        console.log(err);
    }
}

const addUser = async (data) => {
    let res = await db.collection("users").findOne({email:data.email});
    if(res)
        return 409;
    else{
        res = await db.collection("users").insertOne(data);
        if(res.acknowledged)
            return 200;
        else
            return 500;
    }
}

const loginUser = async (data) => {
    let res = await db.collection("users").findOne({email:data.email,password:data.password});
    if(res){
        if(res.email==data.email)
            return 200;
        else
            return 500;
    }
    else{
        return 404;
    }
}

const fetchAll = async (email) => {
    let res = await db.collection("users").findOne({email:email});
    if(res){
        if(res.root)
            return res.root;
        else
            return null;
    }
    else
        return null;
}

const addFile = async (email,path,fileName,mime,bsondata) => {
    if(path=="/")
        path="";
    
    const parts = path.split("/");
    
    let query = "root.children";
    let arrayFilters = [];
    let currentPosition = 0;
    for(let i=0;i<parts.length;i++){
        if(parts[i]!=""){
            let filter = "filter"+i;
            query+=".$["+filter+"].children";
            let key = `${filter}.path`
            let index = path.indexOf(parts[i],currentPosition);
            let substring = path.substring(0, index + parts[i].length);
            arrayFilters.push({[key]:substring})
            currentPosition = index + parts[i].length;
        }
    }
    
    try{
        await db.collection("users").findOneAndUpdate(
            {email:email},
            {
                $push:{
                    [query]:{ 
                        path: path+"/"+fileName,
                        title: fileName,
                        type: "file",
                        mimeType: mime,
                        icon: bsondata
                    }
                }
            },
            {
                arrayFilters:arrayFilters
            }
        );
        return 200;
    }
    catch(err){
        console.log("Some Error occurred while creating folder",err);
        return 500;
    }    
}

const addFolder = async (email,path,folderName) => {
    if(path=="/")
        path="";
    
    const parts = path.split("/");
    
    let query = "root.children";
    let arrayFilters = [];
    let currentPosition = 0;
    for(let i=0;i<parts.length;i++){
        if(parts[i]!=""){
            let filter = "filter"+i;
            query+=".$["+filter+"].children";
            let key = `${filter}.path`
            let index = path.indexOf(parts[i],currentPosition);
            let substring = path.substring(0, index + parts[i].length);
            arrayFilters.push({[key]:substring})
            currentPosition = index + parts[i].length;
        }
    }
    
    try{
        await db.collection("users").findOneAndUpdate(
            {email:email},
            {
                $push:{
                    [query]:{ 
                        path: path+"/"+folderName,
                        title: folderName,
                        type: "folder",
                        children:[]
                    }
                }
            },
            {
                arrayFilters:arrayFilters
            }
        );
        return 200;
    }
    catch(err){
        console.log("Some Error occurred while creating folder",err);
        return 500;
    }    
}

const closeConnection = async () => {
    try{
        await client.close();
    }
    catch(err){
        console.log(err);
    }
}

module.exports = {connectClient,addUser,loginUser,fetchAll,addFile,addFolder,closeConnection};
