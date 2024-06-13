import Icon from "./folder.png";

export default function Root(){
    return(
    <div className="border-2 rounded-md p-5 my-5 m-auto w-11/12 overflow-auto">
        <div className="flex flex-col items-center cursor-pointer hover:underline w-fit" role="link">
            <img src={Icon} alt="root" width={96} height={96} title="root" />
            <span>root</span>
        </div>
    </div>
    );
}