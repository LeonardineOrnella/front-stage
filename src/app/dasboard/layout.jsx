import NavBar from "@/components/backoOffice/NavBar";
import SideBar from "@/components/backoOffice/SideBar";

export default function RootLayoutAdmin({ children }) {
    return (

        < div className='flex '>
           <div className="">
           <SideBar/>
           </div>
           <div className="w-full">
            <div className="w-full">
            <NavBar/>
            </div>
           {children}
           </div>
        </div>

    );
}