import { auth } from "@/auth";
import { redirect } from "next/navigation";
import WriteForm from "@/components/write-form";

export const dynamic = "force-dynamic";

export default async function WritePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/write");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl font-serif font-bold text-coffee-950">Start Writing</h1>
        <p className="text-coffee-600">
          Pour yourself a cup of coffee and let the words flow. Begin your new story here.
        </p>
      </div>

      <WriteForm />
    </div>
  );
}
