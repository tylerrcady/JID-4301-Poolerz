import { auth } from "@/auth";
import Header from "@/components/header";
import Login from "@/components/login";
import CalendarView from "@/components/calendar-view";
import Footer from "@/components/footer";

export default async function Page() {
    const session = await auth();

    return (
        <div className="flex items-center justify-between h-full min-h-screen flex-col text-gray bg-w">
            <Header
                userId={session?.user?.id}
                isFormComplete={true}
                currentPath={"/dashboard"}
            />

            {session?.user?.id ? (
                <CalendarView userId={session?.user?.id} />
            ) : (
                <Login />
            )}

            <Footer />
        </div>
    );
}
