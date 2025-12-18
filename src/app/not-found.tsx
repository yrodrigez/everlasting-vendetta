"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "./components/Button";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex justify-center align-middle h-full w-full">
      <div className="relative mx-auto flex max-w-6xl items-center px-6">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <section className="order-1 lg:order-1">
            <div className="relative overflow-hidden rounded-[28px]">
              <Image
                src="/img-404.png"
                alt="Vendetto looking puzzled"
                width={1200}
                height={900}
                priority
                className="relative h-auto w-full object-cover"
              />
            </div>
          </section>
          <section className="order-2 lg:order-2">
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
              Lost in the deep…
              <span className="block text-primary/90">this page isn't here.</span>
            </h1>

            <p className="mt-4 max-w-prose text-base leading-relaxed text-primary/80">
              Vendetto looks puzzled—like something's gone wrong. The path you
              followed might be broken, or the page has slipped into the mist.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                as="a"
                href="/"
                className="shadow-lg shadow-gold/20 transition focus:outline-none focus:ring-2 focus:ring-gold-100/70 focus:ring-offset-2 focus:ring-offset-dark"
              >
                Return Home
              </Button>

              <Button
                type="button"
                onPress={() => router.back()}
                className="border border-gold/40 bg-wood-900/30 px-5 py-3 text-sm font-semibold text-primary/90 shadow-sm transition hover:border-gold/60 hover:bg-wood-900/45 focus:outline-none focus:ring-2 focus:ring-gold-100/50 focus:ring-offset-2 focus:ring-offset-dark"
              >
                Go Back
              </Button>
            </div>

            <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
            <p className="mt-4 text-xs text-primary/50">
              If you believe this is a mistake, check the URL or head back to the
              guild hall.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
