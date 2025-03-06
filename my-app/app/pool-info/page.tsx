import { auth } from "@/auth"; // should always import for anything that requires authorization
import Footer from "@/components/footer";
import Header from "@/components/header";
import PoolInfo from "@/components/pool-info"; // this is named after the file we created above this, so TWEAK accordingly
import Main from "@/components/main";

export default async function Page() {
    const session = await auth();

    return (
        <div className="h-full flex items-center justify-between flex-col bg-w">
            <Header userId={session?.user?.id} 
            isFormComplete={true}
            currentPath="/pool-info" />
            {session?.user?.id ? (
                <PoolInfo userId={session?.user?.id} />
            ) : (
                <Main userName={session?.user?.name} />
            )}
            <Footer />
        </div>
    );
}