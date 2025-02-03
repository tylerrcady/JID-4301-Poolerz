import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/header";
//import Login from "@/components/login";
import Main from "@/components/main";
import UserProfile from "@/components/user-profile";
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
        <div className="flex items-center justify-between h-screen flex-col bg-w">
            <Header userId={userId} isFormComplete={isFormComplete} />
            {session?.user?.id ? (
                <UserProfile
                    userId={session?.user?.id}
                    name={session?.user?.name}
                    email={session?.user?.email}
                />
            ) : (
                <Main userName={session?.user?.name} />
            )}
            <Footer />
        </div>
    );
}
