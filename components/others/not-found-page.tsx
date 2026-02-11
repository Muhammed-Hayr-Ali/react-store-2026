import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

export default function NotFoundPage() {
    return (
      <Card className="mx-auto w-full max-w-sm pb-0 shadow-2xl">
        <CardHeader>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The requested page could not be found.{" "}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <h1 className="text-muted-foreground text-8xl ">404</h1>
        </CardContent>
        <CardFooter className="bg-muted py-4 border-t">
          <Button variant="outline" className="grow" asChild>
            <Link href={`/`}>Go To Home</Link>
          </Button>
        </CardFooter>
      </Card>
    );
}