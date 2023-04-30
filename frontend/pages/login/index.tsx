import Layout from "@src/components/shared/Layout";
import SharedLoginForm from "@src/components/shared/sharedLoginForm/sharedLoginForm";
import useLoginService from "@auth/useLoginService";
import useCredentials from "@auth/helpers/useCredentials";

import type { LoginValues } from "@src/components/shared/sharedLoginForm/interfaces";

const Login = () => {
  const { loginService } = useLoginService();
  const { setCredentials } = useCredentials();

  const onSubmit = async (values: LoginValues) => {
    const { token, user } = await loginService(values.email!, values.password!);
    await setCredentials(token, user);

  };

  return (
    <Layout isLogin>
      <div className="flex flex-col items-center w-96 space-y-8 mt-28 rounded bg-gradient-to-br from-lime-300 to-emerald-500 py-3 font-smooch shadow-lg">
        <SharedLoginForm
          onSubmit={onSubmit}
          buttonTitle="login"
          displayEmailField
          displayPasswordField
        />
        <div className="text-formsGlobalColor hover:text-generalWarningBackground hover:underline">
          <a href="/forgotPassword">
            mot de passe oublié ?
          </a>
        </div>
      </div>
    </Layout>
  );
};

Login.auth = false;

export default Login;

