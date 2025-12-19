import Image from "next/image";

export function SomethingWentWrong({
    header,
    subheader,
    body,
    footer,
}: {
    header?: string;
    subheader?: string;
    body?: React.ReactNode;
    footer?: React.ReactNode;
}) {
    return (
        <main className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-10 text-primary">
            <div className="relative mx-auto w-full max-w-6xl">
                <div className="grid overflow-hidden rounded-[28px] bg-dark-100/20 border border-gold/25 shadow-2xl shadow-black/40 lg:grid-cols-2">
                    <div className="relative min-h-[500px]">
                        <Image
                            src="/something-wrong.png"
                            alt="Vendetto by a portal"
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </div>

                    <div className="flex flex-col justify-center p-6 sm:p-10">

                        {header && <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
                            {header || "Something went wrong"}
                        </h1>}

                        {subheader && <p className="mt-3 max-w-prose text-sm leading-relaxed text-primary/80">
                            {subheader}
                        </p>}

                        {body && <div className="mt-8 flex w-full flex-col gap-3">
                            {body}
                        </div>}

                        {footer && <><div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                            <div className="mt-3 text-xs text-primary/55">
                                {footer || "If the problem persists, please contact support or try again later."}
                            </div>
                        </>}
                    </div>
                </div>
            </div>
        </main>
    );
}