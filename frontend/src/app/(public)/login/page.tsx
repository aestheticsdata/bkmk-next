"use client";

import useCredentials from "@auth/helpers/useCredentials";
import useLoginService from "@auth/useLoginService";
import Layout from "@components/shared/Layout";
import SharedLoginForm from "@components/shared/sharedLoginForm/sharedLoginForm";

import type { LoginValues } from "@components/shared/sharedLoginForm/interfaces";

export default function LoginPage() {
  const { loginService } = useLoginService();
  const { setCredentials } = useCredentials();

  const onSubmit = async (values: LoginValues) => {
    const { token, user } = await loginService(values.email!, values.password!);
    await setCredentials(token, user);
  };

  return (
    <Layout
      isLogin
      displayTools={false}
    >
      <div className="mt-28 flex w-96 flex-col items-center space-y-8 rounded bg-gradient-to-br from-lime-300 to-emerald-500 py-3 font-smooch shadow-lg">
        <SharedLoginForm
          onSubmit={onSubmit}
          buttonTitle="login"
          displayEmailField
          displayPasswordField
        />
        <div className="text-formsGlobalColor hover:text-generalWarningBackground hover:underline">
          <a href="/forgotPassword">mot de passe oublié ?</a>
        </div>
      </div>
    </Layout>
  );
}
