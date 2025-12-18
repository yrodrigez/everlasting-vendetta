import Image from "next/image";
import { BnetLoginButton } from "@/app/components/BnetLoginButton";
import { DiscordLoginButton } from "@/app/components/DiscordLoginButton";
import { TemporalLogin } from "@/app/raid/components/TemporalLogin";

export default function NotLoggedInView({ hideTitle = false }: { hideTitle?: boolean }) {
    return (
        <main className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-10 text-primary">
            <div className="relative mx-auto w-full max-w-6xl">
                <div className="grid overflow-hidden rounded-[28px] bg-dark-100/20 border border-gold/25 shadow-2xl shadow-black/40 lg:grid-cols-2">
                    <div className="relative min-h-[280px]">
                        <Image
                            src="/not-logged-in.png"
                            alt="Vendetto by a portal"
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </div>

                    <div className="flex flex-col justify-center p-6 sm:p-10">
                        {hideTitle ? null : (
                            <>
                                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
                                    You should be logged in to continue
                                </h1>

                                <p className="mt-3 max-w-prose text-sm leading-relaxed text-primary/80">
                                    Sign in with Battle.net or Discord, or use a temporary login if you have one.
                                </p>
                            </>
                        )}

                        <div className="mt-8 flex w-full flex-col gap-3">
                            <BnetLoginButton />
                            <DiscordLoginButton />

                            <div className="flex w-full items-center justify-center gap-3 py-2">
                                <div className="h-px w-full bg-gradient-to-l from-gold/70 via-gold/20 to-transparent" />
                                <span className="text-xs uppercase tracking-widest text-primary/60">or</span>
                                <div className="h-px w-full bg-gradient-to-r from-gold/70 via-gold/20 to-transparent" />
                            </div>

                            <TemporalLogin />
                        </div>

                        <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                        <p className="mt-3 text-xs text-primary/55">
                            If you think you should have access, try refreshing after logging in.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
