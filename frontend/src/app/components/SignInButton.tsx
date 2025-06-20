import { signIn, signOut, useSession } from "next-auth/react"
import Image from "next/image"
import GoogleIcon from "@/assets/google.webp"
 
type TSignInButtonProps = {
  className?: string
}

export default function SignInButton({ className = '' }: TSignInButtonProps) {
  const { status } = useSession();

  return status === 'authenticated' ? (
      <button
        className="bg-gray-800 hover:bg-red-300 px-4 py-2 rounded-lg shadow-md text-white"
        onClick={() => {
          signOut();
        }}
      >
        Logout
      </button>
  ) : (
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
