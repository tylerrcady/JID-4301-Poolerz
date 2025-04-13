import React, { Suspense } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Main from "@/components/main";
import JCComp from "@/components/JCComp";
import { auth } from "@/auth";
import { checkFormCompletion } from "@/lib/user-form-data";

const CarpoolJoinedPageContent: React.FC = async () => {
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
                <JCComp />
            ) : (
                <Main userName={session?.user?.name} />
            )}
            <Footer />
        </div>
    );
};

export default CarpoolJoinedPageContent;
