import { Inter } from 'next/font/google';
import styles from './page.module.css';
import Hello from "@/components/hello";

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <main className={styles.main}>
      <Hello />
    </main>
  )
}
