import Link from "next/link";

export default function VxHomeButton() {
    const vxBlur = '/vx/ev-vx-off.webp';
    const vxHover = '/vx/ev-vx-on.webp';
    const className = "px-2 py-1 flex flex-col items-center rounded hover:cursor-pointer hover:bg-white hover:bg-opacity-20 backdrop-filter backdrop-blur-md min-w-16 max-w-16 transition-all duration-300 ease-in-out";

    return (
        <Link
            className={className + " group"}
            href={`/vx`}
        >
            <div className="relative w-9 h-9 rounded-full">
                <img

                    width="36"
                    height="36"
                    alt="VX" src={vxBlur}
                    className="group-hover:opacity-0 transition-all duration-300 ease-in-out absolute top-0 left-0 rounded-full w-9 h-9 min-h-9 max-h-9 min-w-9 max-w-9"
                />
                <img
                    width="36"
                    height="36"
                    alt="VX" src={vxHover}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out absolute top-0 left-0 rounded-full w-9 h-9 min-h-9 max-h-9 min-w-9 max-w-9"
                />
            </div>
            <span
                className="text-sm"
            >VX</span>
        </Link>
    );
}
