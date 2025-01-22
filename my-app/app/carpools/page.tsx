import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Login from "@/components/login";
import Carpools from "@/components/carpools"

export default async function Page() {
    const session = await auth();
    return (
        <div className="flex items-center justify-between h-screen flex-col bg-w">
            <Header userId={session?.user?.id} />
            {session?.user?.id ? (
                <Carpools userId={session?.user?.id} />
            ) : (
                <Login />
            )}
            <Footer />
        </div>
    );
}