import { createMetadata } from "@/lib/config/metadata_generator"
import SignInForm from "@/components/auth/sign-in-form"


export const metadata = createMetadata({
    title: "Sign In",
    description: "Sign in to your Marketna account to access premium features and personalized services.",
    path: "/sign-in",
})

export default function Page() {
    return (
        <SignInForm />
    )
}
