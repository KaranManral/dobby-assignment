import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register(){
    const navigate = useNavigate();
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [pwd,setPwd] = useState("");
    const [cpwd,setCPwd] = useState("");

    useEffect(()=>{
        let token = sessionStorage.getItem("token");
        if(token&&token.length>0)
            navigate("/");
    });

    async function registerUser(e){
        e.preventDefault();
        const regExp = new RegExp(/^[a-zA-Z0-9@.#\ ]+$/);
        if(name===""||email===""||pwd===""||cpwd===""){
            alert("All fields are required");
            return false;
        }
        if(pwd !== cpwd){
            alert("Password and Confirm Password should match");
            return false;
        }
        if(!regExp.test(name)){
            alert("Invalid Name");
            return false;
        }
        if(!regExp.test(email)){
            alert("Invalid Email");
            return false;
        }
        if(!regExp.test(pwd)){
            alert("Invalid Password");
            return false;
        }
        const data = {name:name,email:email,password:pwd,root:{title:"root",path:"/",type:"folder",children:[]}};
        const res = await fetch("/api/register",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(data)
        })
        if(res.status===200){
            alert("User Added Successfully");
            navigate("/login");
        }
        else if(res.status === 500)
            alert("Server Error");
        else if(res.status === 409)
            alert("User Already Exists");
        else
            alert("Bad Request");
        return true;
    }

    return(
        <div className="container">
            <form action="/api/register" method="post" className="flex flex-col justify-around items-center w-80 min-h-96 max-h-96 border-2 rounded-md mx-auto my-40" onSubmit={(e)=>{registerUser(e)}}>
                <div className="header bg-blue-400 text-white text-center text-4xl w-full">Register</div>
                <input type="text" className="border rounded-sm p-3 w-11/12 text-center" placeholder="Enter your Name" required name="name" id="name" value={name} onChange={(e)=>{setName(e.target.value)}} />
                <input type="email" className="border rounded-sm p-3 w-11/12 text-center" placeholder="Enter Email Id" required name="email" id="email" value={email} onChange={(e)=>{setEmail(e.target.value)}} />
                <input type="password" className="border rounded-sm p-3 w-11/12 text-center" placeholder="Enter Password" required name="pwd" id="pwd" value={pwd} onChange={(e)=>{setPwd(e.target.value)}} />
                <input type="password" className="border rounded-sm p-3 w-11/12 text-center" placeholder="Confirm Password" required name="cpwd" id="cpwd" value={cpwd} onChange={(e)=>{setCPwd(e.target.value)}} />
                <span role="link" className="text-blue-700 hover:text-violet-700 cursor-pointer" onClick={(e)=>{navigate("/login")}}>Already Registered? Sign In</span>
                <input type="submit" value="Register" className="p-3 bg-green-500 hover:bg-green-600 cursor-pointer text-white rounded-md shadow-md" />
            </form>
        </div>
    );
}