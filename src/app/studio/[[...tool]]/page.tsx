// /**
//  * This route is responsible for the built-in authoring environment using Sanity Studio.
//  * All routes under your studio path is handled by this file using Next.js' catch-all routes:
//  * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
//  *
//  * You can learn more about the next-sanity package here:
//  * https://github.com/sanity-io/next-sanity
//  */

// import { NextStudio } from 'next-sanity/studio'
// import config from '../../../../sanity.config'

// export const dynamic = 'force-static'

// export { metadata, viewport } from 'next-sanity/studio'

// export default function StudioPage() {
//   return <NextStudio config={config} />
// }




import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { isAdminClerkId } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";
export { metadata, viewport } from "next-sanity/studio";

export default async function StudioPage() {
  const { userId } = await auth();

  // If not logged in, just redirect to shop
  if (!userId) {
    return redirect("/shop");
  }

  // If the user is not admin, show "Start Shopping" page
  if (!isAdminClerkId(userId)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-white to-primary text-primary-foreground px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 animate-pulse">
          Access Denied 🚫
        </h1>
        <p className="text-secondary-foreground max-w-md text-center mb-8">
          You can&apos;`t access the admin studio — but don&apos;`t worry!
          <br />
          Let&apos;`s get back to what matters most. 🛍️
        </p>
        <Button variant="secondary" size={"lg"} asChild>
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  // If admin, show Sanity Studio
  return <NextStudio config={config} />;
}