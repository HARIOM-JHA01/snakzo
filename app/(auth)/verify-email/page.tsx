import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-50 via-white to-pink-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Snakzo
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Check your email
          </CardTitle>
          <CardDescription className="text-center">
            We have sent you a verification link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <Mail className="h-16 w-16 text-purple-600" />
            <p className="text-center text-sm text-muted-foreground">
              Please check your email and click the verification link to
              complete your registration.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button variant="outline">Back to login</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
