import { auth } from "@/auth"; // should always import for anything that requires authorization
import Footer from "@/components/footer";
import Header from "@/components/header";
import Login from "@/components/login";
import JoinCarpool from "@/components/join-carpool" // this is named after the file we created above this, so TWEAK accordingly

export default async function Page() {
    const session = await auth();
    return (
        <div className="flex items-center justify-between h-screen flex-col bg-w">
            <Header userId={session?.user?.id} />
            {session?.user?.id ? (
		         <JoinCarpool
                 userId={session?.user?.id} />
            ) : (
                <Login />
            )}
            <Footer />
        </div>
    );
}