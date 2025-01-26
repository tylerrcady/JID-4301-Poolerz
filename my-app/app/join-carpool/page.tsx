import { auth } from "@/auth"; // should always import for anything that requires authorization
import Footer from "@/components/footer";
import Header from "@/components/header";
import JoinCarpool from "@/components/join-carpool"; // this is named after the file we created above this, so TWEAK accordingly
import Main from "@/components/main";
import { checkFormCompletion } from "@/lib/user-form-data";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth();
    const userId = session?.user?.id;

    let isFormComplete = false;

    if (userId) {
        isFormComplete = await checkFormCompletion(userId); // Reassign the value here
        if (!isFormComplete) {
            redirect("/user-form"); // Redirect to form if incomplete
        }
    }

    return (
        <div className="flex items-center justify-between h-screen flex-col bg-w">
            <Header
                userId={session?.user?.id}
                isFormComplete={isFormComplete}
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
