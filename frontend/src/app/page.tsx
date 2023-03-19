import { Inter } from 'next/font/google';
import Hello from "@/components/hello";

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <div className="flex justify-center">
      <Hello />
    </div>
  )
}
