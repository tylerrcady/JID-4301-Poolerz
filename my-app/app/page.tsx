import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Main from "@/components/main";

export default async function Home() {
    const session = await auth();
    return (
        <div className="flex items-center justify-between h-screen flex-col bg-w">
            <Header userId={session?.user?.id} />
            {session?.user?.id ? (
                <Main userId={session?.user?.id} />
            ) : (
                <div>no access</div>
            )}
            <Footer />
        </div>
    );
}
