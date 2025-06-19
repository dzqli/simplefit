import { signIn } from "next-auth/react"
import GoogleIcon from "@/assets/google.webp"
 
type TSignInButtonProps = {
  className?: string
}

export default function SignInButton({ className = '' }: TSignInButtonProps) {
  return (
    <form
      action={async () => {
        const res = await signIn("google")
        console.log("Sign in response:", res)
      }}
    >
      <button className={className} type="submit" aria-label="sign in with google">
        <img className={"w-[24px] h-[24px]"} src={GoogleIcon.src} alt="google logo"/>
      </button>
    </form>
  )
}
