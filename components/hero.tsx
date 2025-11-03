import Image from "next/image";

export function Hero() {
  return (
    <div className="flex flex-col gap-12 items-center w-full py-20">
      <div className="flex gap-4 justify-center items-center text-6xl">
        HEAPS
      </div>
      <h1 className="sr-only">Supabase and Next.js Starter Template</h1>

      <div className="relative w-full h-96 max-w-xl">
        <Image
          src="/images/heap_hero.png"
          alt="Trash Pile"
          fill
          className="object-cover"
          priority
        />
      </div>
      <p className=" lg:text-4xl mx-auto max-w-xl text-center">
        Feed your pile
      </p>
    </div>
  );
}
