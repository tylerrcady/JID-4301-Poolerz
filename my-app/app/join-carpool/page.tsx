import { auth } from "@/auth"; // should always import for anything that requires authorization
import Footer from "@/components/footer";
import Header from "@/components/header";
import JoinCarpool from "@/components/join-carpool"; // this is named after the file we created above this, so TWEAK accordingly
import Main from "@/components/main";

export default async function Page() {
    const session = await auth();

    return (
        <div className="h-full min-h-screen flex items-center justify-between flex-col bg-w text-d">
            <Header
                userId={session?.user?.id}
                isFormComplete={true}
                currentPath="/join-carpool"
            />
            {session?.user?.id ? (
                <JoinCarpool userId={session?.user?.id} />
            ) : (
                <Main userName={session?.user?.name} />
            )}
            <Footer />
        </div>
    );
}
