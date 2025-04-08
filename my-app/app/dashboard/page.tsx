import { auth } from "@/auth";
import Header from "@/components/header";
import Login from "@/components/login";
import CalendarView from "@/components/calendar-view";
import Footer from "@/components/footer";

export default async function Page() {
    const session = await auth();
    return (
        <div className="flex flex-col min-h-screen bg-w text-d">
            <Header
                userId={session?.user?.id}
                isFormComplete={true}
                currentPath={"/dashboard"}
            />
            {session?.user?.id ? (
                <div className="flex flex-col md:flex-row flex-1 w-full px-4 md:px-8 py-6 gap-6">
                    <div className="w-full md:flex-1">
                        <CalendarView userId={session?.user?.id} />
                    </div>
                    <div className="w-full md:w-1/3">
                        Agenda placeholder
                    </div>
                </div>
            ) : (
                <Login />
            )}
            <Footer />
        </div>
    );
}