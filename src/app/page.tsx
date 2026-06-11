import { redirect } from "next/navigation";

export default function Home() {
  // Langsung redirect ke halaman login karena app.nakespro.id hanya untuk dashboard/login
  redirect("/auth/login");
}
