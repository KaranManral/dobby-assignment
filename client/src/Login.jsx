import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getData } from "./App";

export default function Login(props){
    const navigate = useNavigate();
    const [email,setEmail] = useState("");
    const [pwd,setPwd] = useState("");

    const checkLogin = async () => {
        const res = await fetch("/api/check-login");
        if(res.status===200)
            navigate("/");
    }

    useEffect(()=>{
        let token = sessionStorage.getItem("token");
        if(token&&token.length>0){
            checkLogin();
        }
    });

    async function loginUser(e){
        e.preventDefault();
        const regExp = new RegExp(/^[a-zA-Z0-9@.#\ ]+$/);
        if(email===""||pwd===""){
            alert("All fields are required");
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

        const data = {email:email,password:pwd};
        const res = await fetch("/api/login",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(data)
        });
        if(res.status===200){
            const responseData = await res.json();
            sessionStorage.setItem("token",responseData.token);
            await getData(props.setData);
            navigate("/");
        }
        else if(res.status === 500)
            alert("Server Error");
        else if(res.status === 404)
            alert("Invalid Credentials");
        else
            alert("Bad Request");
    
        return true;
    }

    return(
        <div className="container">
            <form action="/api/login" method="post" className="flex flex-col justify-around items-center w-80 min-h-96 max-h-96 border-2 rounded-md mx-auto my-40" onSubmit={(e)=>{loginUser(e)}}>
                <div className="header bg-blue-400 text-white text-center text-4xl w-full">Login</div>
                <input type="email" className="border rounded-sm p-3 w-11/12 text-center" placeholder="Enter Email Id" required name="email" id="email" value={email} onChange={(e)=>{setEmail(e.target.value)}} />
                <input type="password" className="border rounded-sm p-3 w-11/12 text-center" placeholder="Enter Password" required name="pwd" id="pwd" value={pwd} onChange={(e)=>{setPwd(e.target.value)}} />
                <span role="link" className="text-blue-700 hover:text-violet-700 cursor-pointer" onClick={(e)=>{navigate("/register")}}>Register Here</span>
                <input type="submit" value="Login" className="p-3 bg-green-500 hover:bg-green-600 cursor-pointer text-white rounded-md shadow-md" />
            </form>
        </div>
    );
}