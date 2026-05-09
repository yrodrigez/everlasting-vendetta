/*Vendetta Exchange is under construction

The goblins are still calibrating the odds, polishing the coins, and arguing about who gets the biggest cut.

Soon, Everlasting Vendetta members will be able to predict raid outcomes, pledge gold, climb the rankings, and prove they were right all along.

Coming soon. */

export const metadata = {
    title: 'Vendetta Exchange - Coming Soon',
    description: 'The Vendetta Exchange is coming soon! Get ready to predict raid outcomes, pledge gold, and climb the rankings. Stay tuned for updates.',
};

export default function VxPage() {
    return (
        <main className="flex flex-col min-h-screen w-full items-center px-4 py-12 text-primary">
            <h1 className="text-4xl font-bold mb-4">Vendetta Exchange - Coming Soon</h1>
            <div className="[mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] shadow-2xl shadow-gold ">
                <img
                    alt="VX Logo"
                    src="/vx/vx-uc.webp"
                    className="mx-auto mb-10 w-[800px] rounded-lg shadow-xl [mask-image:linear-gradient(to_top,transparent,black_15%,black_85%,transparent)]"
                />
            </div>
            <div className="mx-auto w-full max-w-2xl text-center">
                <p className="text-lg mb-6">The Vendetta Exchange is under construction. The goblins are still calibrating the odds, polishing the coins, and arguing about who gets the biggest cut.</p>
                <p className="text-lg mb-6">Soon, Everlasting Vendetta members will be able to predict raid outcomes, pledge gold, climb the rankings, and prove they were right all along.</p>
                <p className="text-lg font-semibold">Stay tuned for updates!</p>
            </div>
        </main>
    );
}