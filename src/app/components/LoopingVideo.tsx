"use client";
import { useRef, useEffect, useState } from "react";

export default function SeamlessVideo() {
	const videoRef1 = useRef<HTMLVideoElement>(null);
	const videoRef2 = useRef<HTMLVideoElement>(null);
	const [active, setActive] = useState(1);
	const fadeDuration = 500;
	const transitionBuffer = 1;

	/*useEffect(() => {
		const interval = setInterval(() => {
			const currentVideo = active === 1 ? videoRef1.current : videoRef2.current;
			const nextVideo = active === 1 ? videoRef2.current : videoRef1.current;
			if (!currentVideo || !nextVideo) return;

			if (currentVideo.currentTime >= currentVideo.duration - transitionBuffer) {
				if (nextVideo.paused) {
					nextVideo.currentTime = 0;
					nextVideo.play().catch(() => {});
				}

				/!*currentVideo.style.transition = `opacity ${fadeDuration}ms linear`;
				nextVideo.style.transition = `opacity ${fadeDuration}ms linear`;*!/
				currentVideo.style.opacity = "0";
				nextVideo.style.opacity = "1";

				setTimeout(() => {
					currentVideo.pause();
					currentVideo.currentTime = 0;
					currentVideo.style.transition = "";
					nextVideo.style.transition = "";
					setActive(active === 1 ? 2 : 1);
				}, fadeDuration);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [active, fadeDuration, transitionBuffer]);*/

	return (
		<div className="relative w-full h-full overflow-hidden">
			<video
				ref={videoRef1}
				autoPlay
				loop

				muted
				playsInline
				className="absolute top-0 left-0 w-full h-full object-cover transtion-all duration-500"
				style={{ opacity: active === 1 ? 1 : 0 }}
			>
				<source src="/scarlet_enclave.mp4" type="video/mp4" />
			</video>
			{/*<video
				ref={videoRef2}
				autoPlay
				muted
				playsInline
				className="absolute top-0 left-0 w-full h-full object-cover transtion-all duration-500"
				style={{ opacity: active === 2 ? 1 : 0 }}
			>
				<source src="/scarlet_enclave.mp4" type="video/mp4" />
			</video>*/}
		</div>
	);
}
