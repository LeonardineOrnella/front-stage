import NavBar from "@/components/backoOffice/NavBar";
import SideBar from "@/components/backoOffice/SideBar";
import AuthGuard from "@/components/backoOffice/AuthGuard";
import ErrorBoundary from "@/components/backoOffice/ErrorBoundary";
import NotificationManager from "@/components/backoOffice/NotificationManager";
import "./dashboard.css";

export default function RootLayoutAdmin({ children }) {
    return (
        <ErrorBoundary>
            <AuthGuard>
                <div className='flex h-screen bg-gray-50'>
                    {/* Sidebar fixe */}
                    <div className="flex-shrink-0">
                        <SideBar/>
                    </div>
                    
                    {/* Contenu principal avec scroll */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        {/* NavBar fixe en haut */}
                        <div className="flex-shrink-0">
                            <NavBar/>
                        </div>
                        
                        {/* Contenu scrollable */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden">
                            {children}
                        </div>
                    </div>
                </div>
                <NotificationManager />
            </AuthGuard>
        </ErrorBoundary>
    );
}