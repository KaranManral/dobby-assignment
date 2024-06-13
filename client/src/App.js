import './App.css';
import {BrowserRouter as Router,Routes,Route, Navigate} from "react-router-dom";
import GenerateComponent from "./GenerateComponent";
import React, { useEffect, useState } from 'react';
import Register from './Register';
import Login from './Login';

export const getData = async (setData) => {
  const token = sessionStorage.getItem("token");
  const res = await fetch("/api/get-files",{headers:{"Authorization":"Bearer "+token}});
  const data = await res.json();
  console.log(data)
  setData(data);
}

const generateRoutes = (data) => {
  return data.map((x,i)=>{    
    return (
      <React.Fragment key={`${i}_${x.path}`}>
        <Route path={x.path} element={<GenerateComponent data={x.children} />}></Route>
        {x.children&&x.children.length>0?generateRoutes(x.children):""}
      </React.Fragment>
    );
});
}

function App() {
  const [data,setData] = useState([]);
  useEffect(()=>{
    getData(setData);
  });
  return(
    <Router>
      <Routes>
        <Route path='/register' element={<Register />}></Route>
        <Route path='/login' element={<Login setData={setData}/>}></Route>
        {data && data.length > 0 ? generateRoutes(data):null}
        <Route path='*' element={<Navigate to={"/login"} />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
