"use client";
import { useRef, useEffect, useState } from "react";

export default function () {
	const videoRef1 = useRef<HTMLVideoElement>(null);
	const videoRef2 = useRef<HTMLVideoElement>(null);
	const [active, setActive] = useState(1);
	const fadeDuration = 1000; // Increased for smoother transition
	const transitionBuffer = 2.5; // Start transition earlier
	const videoPath = "/banner-cropped.mp4";
	const transitionInProgress = useRef(false);

	useEffect(() => {
		const checkTime = () => {
			const currentVideo = active === 1 ? videoRef1.current : videoRef2.current;
			const nextVideo = active === 1 ? videoRef2.current : videoRef1.current;
			if (!currentVideo || !nextVideo || transitionInProgress.current) return;

			if (currentVideo.currentTime >= currentVideo.duration - transitionBuffer) {
				transitionInProgress.current = true;


				nextVideo.currentTime = 0;
				const playPromise = nextVideo.play();

				if (playPromise !== undefined) {
					playPromise.then(() => {
						currentVideo.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
						nextVideo.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
						nextVideo.style.opacity = "1";
						currentVideo.style.opacity = "0";

						setTimeout(() => {
							setActive(active === 1 ? 2 : 1);
							currentVideo.pause();
							currentVideo.currentTime = 0;
							transitionInProgress.current = false;
						}, fadeDuration);
					}).catch(error => {
						console.log("Video play failed:", error);
						transitionInProgress.current = false;
					});
				}
			}
		};

		let animationFrame: number;
		const checkLoop = () => {
			checkTime();
			animationFrame = requestAnimationFrame(checkLoop);
		};

		animationFrame = requestAnimationFrame(checkLoop);

		// Initialize both videos
		if (videoRef1.current && videoRef2.current) {
			videoRef1.current.style.opacity = active === 1 ? "1" : "0";
			videoRef2.current.style.opacity = active === 2 ? "1" : "0";
			if (active === 1) {
				videoRef1.current.play().catch(() => {});
			} else {
				videoRef2.current.play().catch(() => {});
			}
		}

		return () => {
			cancelAnimationFrame(animationFrame);
		};
	}, [active, fadeDuration, transitionBuffer]);

	return (
		<div className="relative w-full h-full aspect-video overflow-hidden">
			<video
				ref={videoRef1}
				muted
				playsInline
				className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
				style={{ opacity: active === 1 ? 1 : 0 }}
			>
				<source src={videoPath} type="video/mp4" />
			</video>
			<video
				ref={videoRef2}
				muted
				playsInline
				className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
				style={{ opacity: active === 2 ? 1 : 0 }}
			>
				<source src={videoPath} type="video/mp4" />
			</video>
		</div>
	);
}
