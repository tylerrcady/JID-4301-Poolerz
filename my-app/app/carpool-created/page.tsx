import React, { Suspense } from "react";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { auth } from "@/auth";
import CCComp from "@/components/CCComp";
import Main from "@/components/main";
import { redirect } from "next/navigation";
import { checkFormCompletion } from "@/lib/user-form-data";

const CarpoolCreatedPageContent: React.FC = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    let isFormComplete = false;

    if (userId) {
        isFormComplete = await checkFormCompletion(userId);
        if (!isFormComplete) {
            redirect("/user-form");
        }
    }

    return (
        <div className="flex items-center justify-between h-full min-h-screen flex-col text-d bg-w">
            <Header
                userId={session?.user?.id}
                isFormComplete={true}
                currentPath="/carpool-created"
            />
            {session?.user?.id ? (
                <CCComp />
            ) : (
                <Main userName={session?.user?.name} />
            )}
            <Footer />
        </div>
    );
};

export default CarpoolCreatedPageContent;
