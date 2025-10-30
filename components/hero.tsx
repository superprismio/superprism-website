import Image from "next/image";

export function Hero() {
  return (
    <div className="flex flex-col gap-3 items-center w-full">
      <div className="flex gap-8 justify-center items-center text-3xl">
        the heap
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
