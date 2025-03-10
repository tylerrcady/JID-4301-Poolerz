import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Main from "@/components/main";
import { checkFormCompletion } from "@/lib/user-form-data";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
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
        <div className="flex items-center justify-between h-full flex-col bg-w text-d">
            <Header userId={userId} 
            isFormComplete={isFormComplete} 
            currentPath="/" 
            />
            <main className="flex-grow">
                {userId ? (
                    <Main userName={session?.user?.name} />
                ) : (
                    <Main userName={session?.user?.name} />
                )}
            </main>
            <Link href="/optimizer">opt</Link>
            <Footer />
        </div>
    );
}
