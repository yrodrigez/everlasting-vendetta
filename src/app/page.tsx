const intro = [
    {
        header: "Welcome to Everlasting Vendetta",
        paragraphs: [
            "Embark on an epic journey with Everlasting Vendetta, a distinguished World of Warcraft guild where legends are forged and camaraderie reigns.",
            "Our guild stands as a beacon for adventurers seeking the thrill of conquest and the warmth of fellowship."
        ]
    },
    {
        header: "United by Legacy, Bound by Adventure",
        paragraphs: [
            "Our guild is more than just a group of gamers; we're a family bound by a shared love for the extraordinary worlds Blizzard has created.",
            "Inspired by the mystic allure of the lore and the enduring spirit of the people, Everlasting Vendetta is a sanctuary for those who cherish history, fantasy, and the relentless pursuit of greatness."
        ]
    },
    {
        header: "Join Our Quest",
        paragraphs: [
            "Whether you're a seasoned raider, a strategic battleground commander, or a spirited newcomer eager to make your mark, you'll find a home here.",
            "We celebrate the victories, weather the storms, and embrace the endless possibilities that lie ahead. With us, every member contributes to our shared story, crafting unforgettable memories and achieving new heights of glory."
        ]
    },
]

const CustomSection = ({header, paragraphs}: { header: string, paragraphs: string[] }) => {
    return (
        <section
            className="flex flex-col justify-around gap-2 p-3 bg-moss border border-gold rounded min-h-[340px] backdrop-filter backdrop-blur-md md:w-80 opacity-90 ">
            <h1 className="font-bold text-xl">{header}</h1>
            {paragraphs.map(paragraph => <p>{paragraph}</p>)}
        </section>
    )
}

export default async function Home() {
    return (
        <main className="flex w-full h-full justify-evenly flex-col">
            <div className="hidden lg:block h-full w-full">
                <div className={
                    "absolute bottom-[51%] left-0 w-full top-0 bg-cover bg-center bg-no-repeat backdrop-filter backdrop-blur-md border-bottom-image"
                } style={{backgroundImage: "url('/banner.png')"}}>
                    <div
                        className="flex flex-col items-center justify-center h-full w-full bg-black bg-opacity-50">
                        <div
                            className="flex flex-col items-center justify-center"
                        >
                            <img alt={'center-img'} src={`/center-img.png`}
                                 className="flex-1 rounded-full w-60"/>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="flex flex-col h-full p-2 gap-3 items-center lg:flex-row lg:flex-wrap lg:items-start lg:justify-center lg:max-w-[1000px]">
                {intro.map((section, index) => <CustomSection key={index} {...section}/>)}
            </div>
        </main>
    );
}
