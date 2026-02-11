import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

export default function ErrorPage({ errorMessage }: { errorMessage: string }) {
    return (
      <Card className="mx-auto w-full max-w-sm pb-0 shadow-2xl">
        <CardHeader>
          <CardTitle>Authentication Failed</CardTitle>
          <CardDescription>
            Authentication has been failed to the API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{errorMessage}</p>
        </CardContent>
        <CardFooter className="bg-muted py-4 border-t">
          <Button variant="outline" className="grow" asChild>
            <Link href={`/`}>Go To Home</Link>
          </Button>
        </CardFooter>
      </Card>
    );
}
