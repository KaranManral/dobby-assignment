import { useLocation, useNavigate } from "react-router-dom";
import Icon from "./folder.png";
import CreateFolderModal from "./CreateFolderModal";
import { useState } from "react";

export default function GenerateComponent(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams,setSearchParams] = useState("");

  async function uploadImage(e){
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('path', location.pathname);
    const bearer = sessionStorage.getItem("token");
    const res = await fetch("/api/add-file",
        {
            method:"POST",
            headers:{
              "Authorization": "Bearer "+bearer
            },
            body:formData
        }
    );
    if(res.status===200){
      alert("File Added Successfully");
      navigate('.', { replace: true }); 
      return;
    }
    else if(res.status === 500){
      alert("Server Error");
      return;
    }
    else if(res.status === 400){
      alert("File Upload Failed");
      return;
    }
    else if(res.status === 401){
      alert("Unauthorized");
      return;
    }
  }
  
  function createFolder(e){
    let modal = document.getElementById("modal");
    modal.classList.remove("hidden");
    modal.classList.add("block");
  }

  async function logout(e){
    const res = await fetch("/api/logout");
    if(res.status===200){
      sessionStorage.removeItem("token");
      navigate("/login");
    }
  }

  return (
    <div className="flex justify-around flex-wrap items-center border-2 rounded-md p-5 my-5 m-auto w-11/12 overflow-auto -z-10">
        <CreateFolderModal path={location.pathname} />
        <button type="button" title="Create Folder" className="px-5 py-3 bg-blue-600 hover:bg-blue-500 cursor-pointer text-white h-fit rounded-md shadow-md" onClick={(e)=>{createFolder(e)}} >Create Folder</button>
        <label htmlFor="file" type="button" role="button" title="Upload Image" className="px-5 py-3 bg-green-600 hover:bg-green-500 cursor-pointer text-white h-fit rounded-md shadow-md" >Upload Image</label>
        <input type="file" name="file" id="file" accept="image/*" multiple={false} className="hidden" onChange={(e)=>{uploadImage(e)}} />
        <span className="border rounded-sm"><input type="search" className="p-3 rounded-sm" placeholder="Search" name="search" id="search" value={searchParams} onChange={(e)=>{setSearchParams(e.target.value)}} />&#128269;</span>
        <button type="button" title="Logout" className="px-5 py-3 bg-red-600 hover:bg-red-500 cursor-pointer text-white h-fit rounded-md shadow-md" onClick={(e)=>{logout(e)}} >Logout</button>
        <span className="w-screen my-10"></span>
      {props.data.map((x, i) => {
        return (
          <>
          {searchParams === "" || x.title.includes(searchParams)?
            <div
            className="flex flex-col items-center cursor-pointer hover:underline w-fit"
            role="link"
            key={x.path}
            onClick={() => {
              if(x.type=="folder")
                navigate(x.path);
            }}
          >
            <img
              src={x.type == "folder" ? Icon : `data:${x.mimeType};base64,${x.icon}`}
              alt={x.title}
              width={96}
              height={96}
              title={x.title}
            />
            <span>{x.title}</span>
          </div>
          :""}
          </>
        );
      })}
    </div>
  );
}
