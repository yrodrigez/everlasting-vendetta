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
    {
        header: "Celebrate Our Triumphs",
        paragraphs: [
            "In Everlasting Vendetta, every battle is an opportunity for glory, and every achievement is a testament to our collective strength.",
            "Our Raid Calendar is bustling with plans, our Roster is brimming with heroes, and our News section is your source for all the latest guild triumphs and updates."
        ]
    },
    {
        header: "Discover Your Legend",
        paragraphs: [
            "Join us, and together, let's carve out our place in the annals of Azeroth. Forge your path, rise to the challenge, and embrace the spirit of the people.",
            "Everlasting Vendetta is a sanctuary for those who cherish history, fantasy, and the relentless pursuit of greatness."
        ]
    }
]

const CustomSection = ({header, paragraphs}: {header: string, paragraphs: string[]}) => {
    return (
        <section
            className="flex flex-col items-center justify-center gap-2 p-3 bg-[rgb(19,19,19,.6)] border-[1px]  border-[rgb(20,20,20,.9)] rounded-xl backdrop-filter backdrop-blur-md md:w-80">
            <h1 className="font-bold text-xl">{header}</h1>
            {paragraphs.map(paragraph => <p>{paragraph}</p>)}
        </section>
    )
}

export default async function Home() {
    return (
        <main className="flex w-full h-full">
            <div className="flex flex-col items-center p-2 gap-3 md:flex-row md:flex-wrap md:items-start justify-center">
            {intro.map((section, index) => <CustomSection key={index} {...section}/>)}
            </div>
        </main>
    );
}
