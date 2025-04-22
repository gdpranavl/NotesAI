import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center space-y-8">
        <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
          Your Notes, <span className="text-primary">Smarter</span> with AI
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Create, manage, and summarize your notes with the power of AI. 
          Stay organized and save time with automatic note summarization.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
