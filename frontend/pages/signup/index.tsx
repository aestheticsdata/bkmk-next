import SharedLoginForm from "@components/shared/sharedLoginForm/sharedLoginForm";
import Layout from "@components/shared/Layout";
import useSignupService from "@auth/useSignupService";
import useCredentials from "@auth/helpers/useCredentials";

import type { LoginValues } from "@components/shared/sharedLoginForm/interfaces";

const SignUp = () => {
  const { signupService } = useSignupService();
  const { setCredentials } = useCredentials();

  const onSubmit = async (values: LoginValues) => {
    const { token, user } = await signupService(values);
    if (token) {
      await setCredentials(token, user);
    }
  };

  return (
    <Layout isLogin displayTools={false}>
      <div className="flex flex-col items-center w-96 space-y-8 mt-28 rounded bg-gradient-to-br from-lime-300 to-emerald-500 py-3 font-smooch shadow-lg">
        <SharedLoginForm
          onSubmit={onSubmit}
          buttonTitle="Créer un compte"
          displayEmailField
          displayPasswordField
        />
      </div>
    </Layout>
  );
};

SignUp.auth = false;

export default SignUp;
