import NavBar from "@/components/backoOffice/NavBar";
import SideBar from "@/components/backoOffice/SideBar";
import AuthGuard from "@/components/backoOffice/AuthGuard";
import ErrorBoundary from "@/components/backoOffice/ErrorBoundary";
import NotificationManager from "@/components/backoOffice/NotificationManager";
import "./dashboard.css";
import { UserProvider } from "@/components/backoOffice/student/UserContext";
import BackButton from "@/components/backoOffice/BackButton";

export default function RootLayoutAdmin({ children }) {
    return (
        <ErrorBoundary>
            <AuthGuard>
                <UserProvider>
                <div className='flex h-screen bg-gray-50 overflow-hidden'>
                    {/* Sidebar fixe */}
                    <div className="flex-shrink-0">
                        <SideBar/>
                    </div>
                    
                    {/* Contenu principal avec scroll */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-gray-50">
                        {/* NavBar fixe en haut */}
                        <div className="flex-shrink-0">
                            <NavBar/>
                        </div>
                        
                        {/* Contenu scrollable */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
                            {children}
                        </div>

                        {/* Bouton retour flottant */}
                        <BackButton />
                    </div>
                </div>
                </UserProvider>
                <NotificationManager />
            </AuthGuard>
        </ErrorBoundary>
    );
}