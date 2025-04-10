import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Main from "@/components/main";
import UserForm from "@/components/user-form";
import { Maven_Pro, Open_Sans } from 'next/font/google';

const mavenPro = Maven_Pro({
  weight: ['500'],
  subsets: ['latin'],
  display: 'swap',
});

const openSans = Open_Sans({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default async function Page() {
  const session = await auth();

  return (
    <div className={`flex flex-col items-center justify-between h-full min-h-screen bg-w text-d ${mavenPro.className} ${openSans.className}`}>
      {session?.user?.id ? (
        <main className="w-full">
          <UserForm userId={session.user.id} />
        </main>
      ) : (
        <>
          <Header
            userId={session?.user?.id}
            isFormComplete={false}
            currentPath="/user-form"
          />
          <Main userName={session?.user?.name} />
          <Footer />
        </>
      )}
    </div>
  );
}
