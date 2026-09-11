import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : "/admin"} />;
}
