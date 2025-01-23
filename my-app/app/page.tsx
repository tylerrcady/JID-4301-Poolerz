import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/header";
//import Login from "@/components/login";
import Main from "@/components/main";

export default async function Home() {
    const session = await auth();
    return (
        <div className="flex items-center justify-between h-screen flex-col bg-w text-d">
            <Header userId={session?.user?.id} />
            <main className="flex-grow">
            {session?.user?.id ? (
                <Main userName={session?.user?.name} />
            ) : (
                <Main userName={session?.user?.name}/>
            )}
            </main>
            <Footer />
        </div>
    );
}
