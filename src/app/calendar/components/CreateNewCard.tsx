'use client'
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd} from "@fortawesome/free-solid-svg-icons";
import {useRef} from "react";

export default function CreateNewCard() {
    const ref = useRef<HTMLDivElement>(null);
    return (
        <Link
            href="/calendar/new"
            className="relative group w-[300px] h-[256px] rounded-md border border-wood-100 bg-wood-900 backdrop-blur p-3 flex flex-col items-center justify-center overflow-hidden">
            <div
                ref={ref}
                className="absolute inset-0 z-10 bg-gradient-to-br from-moss/30 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                {/* @ts-ignore*/}
                <pixel-canvas
                    /* @ts-ignore*/
                    data-colors={`#FF8000,#C9A866,#3E5C4F`}
                />
            </div>
            <div className="absolute inset-0 z-20 pointer-events-none">
                <div
                    className="absolute left-[50%] top-1/2  -translate-y-1/2 transform transition-transform duration-700
                 group-hover:translate-x-[5.1875rem]"
                >
                    <div className="relative aspect-[224/280] w-[calc(224/16*1rem)]">
                        <svg
                            viewBox="0 0 224 280"
                            height="280"
                            fill="none"
                            aria-hidden="true"
                            className="absolute inset-0 h-full w-full overflow-visible"
                        >
                            <path

                                fill="#423B35"
                                fillOpacity="1"
                                d="M8 .25a8 8 0 0 0-8 8v91.704c0 2.258.954 4.411 2.628 5.927l10.744 9.738A7.998 7.998 0 0 1 16 121.546v36.408a7.998 7.998 0 0 1-2.628 5.927l-10.744 9.738A7.998 7.998 0 0 0 0 179.546v92.204a8 8 0 0 0 8 8h308a8 8 0 0 0 8-8V8.25a8 8 0 0 0-8-8H8Z"
                            />
                            <path
                                stroke="#5f5a53"
                                strokeOpacity="1"
                                d="M.5 99.954V8.25A7.5 7.5 0 0 1 8 .75h308a7.5 7.5 0 0 1 7.5 7.5v263.5a7.5 7.5 0 0 1-7.5 7.5H8a7.5 7.5 0 0 1-7.5-7.5v-92.204a7.5 7.5 0 0 1 2.464-5.557l10.744-9.737a8.5 8.5 0 0 0 2.792-6.298v-36.408a8.5 8.5 0 0 0-2.792-6.298l-10.744-9.737A7.5 7.5 0 0 1 .5 99.954Z"
                            />
                        </svg>
                        <div
                            className="absolute left-4 top-1/2 -mt-7 flex h-14 w-5 items-center overflow-hidden">
                            <div className="-ml-4 h-10 w-5 rounded-[50%] bg-moss-300/20 blur"/>
                            <div
                                className="from-bg-moss-300/0 via-bg-moss-300/10 to-bg-moss-300/0 absolute inset-y-4 left-0 w-px bg-gradient-to-t"/>
                        </div>
                    </div>
                </div>
                <div
                    className="absolute right-1/2 top-1/2 -translate-y-1/2 transform transition-transform duration-700
                 group-hover:translate-x-[-5.1875rem]"
                >
                    <div className="relative aspect-[224/280] w-[calc(224/16*1rem)] -scale-x-100">
                        <svg
                            viewBox="0 0 224 280"
                            height="280"
                            fill="none"
                            aria-hidden="true"
                            className="absolute inset-0 h-full w-full overflow-visible"
                        >
                            <path
                                fill="#423B35"
                                fillOpacity="1"
                                d="M8 .25a8 8 0 0 0-8 8v91.704c0 2.258.954 4.411 2.628 5.927l10.744 9.738A7.998 7.998 0 0 1 16 121.546v36.408a7.998 7.998 0 0 1-2.628 5.927l-10.744 9.738A7.998 7.998 0 0 0 0 179.546v92.204a8 8 0 0 0 8 8h308a8 8 0 0 0 8-8V8.25a8 8 0 0 0-8-8H8Z"
                            />
                            <path
                                stroke="#5f5a53"
                                strokeOpacity="1"
                                d="M.5 99.954V8.25A7.5 7.5 0 0 1 8 .75h308a7.5 7.5 0 0 1 7.5 7.5v263.5a7.5 7.5 0 0 1-7.5 7.5H8a7.5 7.5 0 0 1-7.5-7.5v-92.204a7.5 7.5 0 0 1 2.464-5.557l10.744-9.737a8.5 8.5 0 0 0 2.792-6.298v-36.408a8.5 8.5 0 0 0-2.792-6.298l-10.744-9.737A7.5 7.5 0 0 1 .5 99.954Z"
                            />
                        </svg>
                        <div
                            className="absolute left-4 top-1/2 -mt-7 flex h-14 w-5 items-center overflow-hidden">
                            <div className="-ml-4 h-10 w-5 rounded-[50%] bg-moss-300/20 blur"/>
                            <div
                                className="from-bg-moss-300/0 via-bg-moss-300/10 to-bg-moss-300/0 absolute inset-y-4 left-0 w-px bg-gradient-to-t"/>
                        </div>
                    </div>
                </div>
            </div>
            <div
                  onMouseEnter={e => ref.current?.dispatchEvent(new MouseEvent('mouseenter'))}
                  onMouseLeave={e => ref.current?.dispatchEvent(new MouseEvent('mouseleave'))}
                  className="bg-moss px-7 py-6 border border-moss-100 text-gold group-hover:border-gold rounded-full transition-all duration-500 group-hover:shadow-[0_0_15px_5px_rgba(201,168,102,0.8)] z-50"
            >
                <FontAwesomeIcon icon={faAdd}/>
            </div>
        </Link>
    )
}