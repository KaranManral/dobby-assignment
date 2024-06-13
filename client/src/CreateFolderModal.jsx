import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateFolderModal(props){
    const navigate = useNavigate();
    const [name,setName] = useState("");
    useEffect(()=>{});
    async function createFolder(){
        if(name===""){
            alert("Name is Required");
            return;
        }

        if(name.includes(" ")){
            alert("Remove Spaces");
            return;
        }

        let regExp = new RegExp(/^[a-zA-Z][a-zA-Z0-9]*$/);

        if(!regExp.test(name)){
            alert("Invalid Folder Name. It should only contain letters and numbers and start with a letter.");
            return;
        }

        let modal = document.getElementById("modal");
        modal.classList.remove("block");
        modal.classList.add("hidden");
        const token = sessionStorage.getItem("token");
        let res = await fetch("/api/add-folder",{
            method:"POST",
            headers:{
                "Content-Type": "application/json",
                "Authorization": "Bearer "+token
            },
            body:JSON.stringify({path:props.path,name:name})
        });
        if(res.status===200){
            alert("Folder Created Successfully");
            navigate('.', { replace: true }); 
        }
    }
    return(
        <div className="modal hidden w-screen h-screen fixed top-0 left-0 bg-black bg-opacity-50" id="modal">

            <div className="modal-box bg-white w-80 h-fit shadow-lg rounded-lg relative mx-auto my-40">
                    <div className="modal-header flex justify-between p-5">
                        <div className="modal-title font-bold">Create Folder</div>
                        <span role="button" className="cursor-pointer" onClick={(e)=>{
                            let modal = document.getElementById("modal");
                            modal.classList.remove("block");
                            modal.classList.add("hidden");
                            }}>X</span>
                    </div>
                    <div className="modal-body flex flex-col justify-center items-center">
                        <input type="text" name="name" id="name" className="border-2 p-2 rounded-sm w-11/12" placeholder="Folder Name" value={name} onChange={(e)=>{setName(e.target.value)}} />
                        <br />
                        <button type="button" title="Create" className="px-5 py-3 bg-blue-600 hover:bg-blue-500 cursor-pointer text-white h-fit rounded-md shadow-md" onClick={(e)=>{createFolder(e)}} >Create</button>
                        <br />
                    </div>
                </div>
        </div>
    );
}