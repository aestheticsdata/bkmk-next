import RequireAuth from "@auth/guards/RequireAuth";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
