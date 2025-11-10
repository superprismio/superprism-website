import Image from "next/image";

export function Hero() {
  return (
    <div className="flex flex-col gap-12 items-center w-full py-20">
      <div className="flex gap-4 justify-center items-center text-6xl">
        Superprism
      </div>
      <h1 className="sr-only">Supabase and Next.js Starter Template</h1>

      <p className=" lg:text-4xl mx-auto max-w-xl text-center">
        A collaborative workspace that is local first ad AI-native
      </p>
    </div>
  );
}
