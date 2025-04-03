import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/header";
//import Login from "@/components/login";
import Main from "@/components/main";
import UserForm from "@/components/user-form";

export default async function Page() {
    const session = await auth();

    return (
        <div className="flex items-center justify-between h-full min-h-screen flex-col bg-w text-d">
            <Header
                userId={session?.user?.id}
                isFormComplete={false}
                currentPath="/user-form"
            />
            {session?.user?.id ? (
                <UserForm userId={session?.user?.id} />
            ) : (
                <Main userName={session?.user?.name} />
            )}
            <Footer />
        </div>
    );
}
