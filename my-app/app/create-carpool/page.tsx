import { auth } from "@/auth"; // should always import for anything that requires authorization
import Footer from "@/components/footer";
import Header from "@/components/header";
import CreateCarpool from "@/components/create-carpool"; // this is named after the file we created above this, so TWEAK accordingly
import Main from "@/components/main";

export default async function Page() {
    const session = await auth();

    return (
        <div className="flex items-center justify-between h-full flex-col bg-w text-d">
            <Header
                userId={session?.user?.id}
                isFormComplete={true}
                currentPath="/create-carpool"
            />
            {session?.user?.id ? (
                <CreateCarpool userId={session?.user?.id} />
            ) : (
                <Main userName={session?.user?.name} />
            )}
            <Footer />
        </div>
    );
}
