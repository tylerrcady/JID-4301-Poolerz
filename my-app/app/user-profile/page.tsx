import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Login from "@/components/login";
import UserProfile from "@/components/user-profile";

export default async function Page() {
    const session = await auth();
    return (
        <div className="flex items-center justify-between h-screen flex-col bg-w">
            <Header userId={session?.user?.id} />
            {session?.user?.id ? (
                <UserProfile userId={session?.user?.id} />
            ) : (
                <Login />
            )}
            <Footer />
        </div>
    );
}
