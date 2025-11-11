import { Header } from "@/components/header";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
    <Header />
    <div className="flex-1 w-full flex flex-col items-center">
      <Hero />
    </div>
  </div>
  );
}
