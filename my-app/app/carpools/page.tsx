import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Carpools from "@/components/carpools";
import Main from "@/components/main";
import { checkFormCompletion } from "@/lib/user-form-data";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth();
    const userId = session?.user?.id;

    let isFormComplete = false;

    if (userId) {
        isFormComplete = await checkFormCompletion(userId);
        if (!isFormComplete) {
            redirect("/user-form"); // Redirect to form if incomplete
        }
    }
    
    return (
        <div className="flex items-center justify-between h-screen flex-col text-gray bg-w">
            <Header userId={session?.user?.id} isFormComplete={isFormComplete} />
            {session?.user?.id ? (
                <Carpools userId={session?.user?.id} />
            ) : (
                <Main userName={session?.user?.name} />
            )}
            <Footer />
        </div>
    );
}
