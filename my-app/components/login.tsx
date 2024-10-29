import { signIn, signOut } from "@/auth";

interface LoginProps {
    userId: string | undefined;
}

const SignIn: React.FC<LoginProps> = ({ userId }) => {
    const callbackUrl = "/";
    return (
        <div>
            <span className="text-sm mr-5">{userId ? userId : "N/A"}</span>
            <span
                onClick={async () => {
                    "use server";
                    if (userId) {
                        await signOut();
                    } else {
                        await signIn("google", { callbackUrl });
                    }
                }}
                className="cursor-pointer text-sm mr-5"
            >
                {userId ? "Logout" : "Login"}
            </span>
        </div>
    );
};

export default SignIn;
