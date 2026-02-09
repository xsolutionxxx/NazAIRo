import AuthHeader from "@features/auth/ui/AuthHeader";
import LoginForm from "@features/auth/ui/LoginForm";
import SocialAuth from "@features/auth/ui/SocialAuth";

export default function AuthLogin() {
   return (
      <>      
         <AuthHeader title="Login" subtitle="Login to access your Golobe account" />
         <LoginForm/>
         <SocialAuth enter="login" />
      </>
   );
}