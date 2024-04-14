import ApplyForm from "@/app/apply/components/ApplyForm";

export default function Page() {
    return (
        <main className="w-full py-6 md:py-12">
            <div className="container grid gap-6 px-4 md:px-6">
                <div className="space-y-2 text-center">
                    <h2 className="text-3xl font-bold text-gold tracking-tighter sm:text-4xl">Apply to Everlasting
                        Vendetta</h2>
                    <p className="mx-auto max-w-[600px] dark:text-gray-400">
                        Fill out the form below to apply to our guild. We are looking for dedicated and friendly
                        players to join our
                        ranks.
                    </p>
                </div>
                <div className="mx-auto max-w-sm space-y-4">
                    <ApplyForm/>
                </div>
            </div>
        </main>
    )
}
