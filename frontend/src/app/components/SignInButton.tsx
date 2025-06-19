import { signIn } from "next-auth/react"
import Image from "next/image"
import GoogleIcon from "@/assets/google.webp"
 
type TSignInButtonProps = {
  className?: string
}

export default function SignInButton({ className = '' }: TSignInButtonProps) {
  return (
    <form
      action={async () => {
        const res = await signIn("google");
        console.log("Sign in response:", res);
      }}
    >
      <button className={className} type="submit" aria-label="sign in with google">
        <Image src={GoogleIcon.src} width={24} height={24} alt="google logo" />
      </button>
    </form>
  )
}
