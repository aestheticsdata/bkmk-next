export interface LoginValues {
  currency?: string;
  email?: string;
  password?: string;
}

export interface SharedLoginFormProps {
  onSubmit: (values: LoginValues) => Promise<void>;
  buttonTitle: string;
  displayEmailField?: boolean;
  displayPasswordField?: boolean;
  displayCurrencyField?: boolean;
}
