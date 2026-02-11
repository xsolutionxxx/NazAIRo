import AuthHeader from "@features/auth/ui/AuthHeader";
import SignUpForm from "@features/auth/ui/SignUpForm";
import SocialAuth from "@features/auth/ui/SocialAuth";

export default function AuthSignUp() {
   return (
      <>      
         <AuthHeader title="Sign up" subtitle="Let's get you all st up so you can access your personal account." />
         <SignUpForm/>
         <SocialAuth enter="sign up" />
      </>
   );
}