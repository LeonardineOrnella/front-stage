import NavBar from "@/components/backoOffice/NavBar";
import SideBar from "@/components/backoOffice/SideBar";
import AuthGuard from "@/components/backoOffice/AuthGuard";
import ErrorBoundary from "@/components/backoOffice/ErrorBoundary";
import NotificationManager from "@/components/backoOffice/NotificationManager";

export default function RootLayoutAdmin({ children }) {
    return (
        <ErrorBoundary>
            <AuthGuard>
                <div className='flex'>
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
                <NotificationManager />
            </AuthGuard>
        </ErrorBoundary>
    );
}