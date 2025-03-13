import { auth } from "@/auth"; // should always import for anything that requires authorization
import Footer from "@/components/footer";
import Header from "@/components/header";
import PoolInfo from "@/components/pool-info";
import Main from "@/components/main";

export default async function DynamicInfo({
    params,
}: {
    params: Promise<{ index: string }>;
}) {
    const session = await auth();
    const { index } = await Promise.resolve(params);

    return (
        <div className="h-full flex items-center justify-between flex-col bg-w">
            <Header
                userId={session?.user?.id}
                isFormComplete={true}
                currentPath={`/pool-info/${index}`}
            />
            {session?.user?.id ? (
                <PoolInfo userId={session?.user?.id} index={index} />
            ) : (
                <Main userName={session?.user?.name} />
            )}
            <Footer />
        </div>
    );
}
