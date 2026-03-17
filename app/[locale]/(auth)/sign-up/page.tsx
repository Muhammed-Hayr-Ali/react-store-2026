import { createMetadata } from "@/lib/config/metadata_generator"
import SignUpForm from "@/components/auth/sign-up-form"

export const metadata = createMetadata({
    title: "Sign Up",
    description: "Create a Marketna account to experience the art of digital refinement.",
    path: "/sign-up",
})

export default function Page() {
    return (
        <SignUpForm />
    )
}
