import { auth } from "@/auth";
import Header from "@/components/header";
import Login from "@/components/login";
import CalendarView from "@/components/calendar-view";
import Footer from "@/components/footer";

export default async function Page() {
    const session = await auth();

    return (
        // 1) Force the entire page to fill the screen height
        <div className="flex flex-col h-full bg-w text-d">
            <Header
                userId={session?.user?.id}
                isFormComplete={true}
                currentPath={"/dashboard"}
            />

            {session?.user?.id ? (
                // 2) Fill the remaining space with the calendar
                <div className="w-full md:flex-1 py-4 px-10">
                    {/* 3) If you want no padding at all, remove px-4 and py-6 */}
                    <CalendarView userId={session?.user?.id} />
                </div>
            ) : (
                <Login />
            )}

            <Footer />
        </div>
    );
}