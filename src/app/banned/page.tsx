export default function Page() {
    return (
        <div
            className="w-full h-full flex items-center justify-center text-4xl text-red-500 font-bold flex-col gap-4 relative">
            <div className="relative flex items-center justify-center">
                <video
                    className="w-96 lg:w-[900px]"
                    autoPlay
                    loop
                    muted
                    src={'/banned_kids.mp4'}>
                </video>
                <img
                    className="w-44 hidden lg:block absolute bottom-0 left-0"
                    src={'/banned.png'} alt="banned"
                />
            </div>
            <span>You have been banned</span>


        </div>
    )
}
