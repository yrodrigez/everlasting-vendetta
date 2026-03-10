"use client";
import { useRef, useEffect } from "react";

export default function LoopingVideo() {
	const videoRef1 = useRef<HTMLVideoElement>(null);
	const videoRef2 = useRef<HTMLVideoElement>(null);
	const activeRef = useRef(1);
	const transitionInProgress = useRef(false);
	
	const fadeDuration = 500;
	const transitionBuffer = 2;
	const videoPath = "/banner-cropped.mp4";

	useEffect(() => {
		const video1 = videoRef1.current;
		const video2 = videoRef2.current;
		if (!video1 || !video2) return;

		// Initial setup - video1 on top and visible, video2 behind and ready
		video1.style.opacity = "1";
		video1.style.zIndex = "2";
		video2.style.opacity = "1"; // Always visible underneath
		video2.style.zIndex = "1";
		video1.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
		video2.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
		
		// Preload video2
		video2.currentTime = 0;
		video2.load();
		
		video1.play().catch(() => {});

		const checkTime = () => {
			const currentVideo = activeRef.current === 1 ? video1 : video2;
			const nextVideo = activeRef.current === 1 ? video2 : video1;
			
			if (transitionInProgress.current) return;
			if (!currentVideo.duration) return;

			if (currentVideo.currentTime >= currentVideo.duration - transitionBuffer) {
				transitionInProgress.current = true;

				// Prepare next video
				nextVideo.currentTime = 0;
				nextVideo.style.opacity = "1";
				nextVideo.style.zIndex = "1"; // Behind current
				
				nextVideo.play().then(() => {
					// Fade out current to reveal next underneath
					currentVideo.style.opacity = "0";

					setTimeout(() => {
						// After fade, swap z-index and reset
						currentVideo.pause();
						currentVideo.currentTime = 0;
						currentVideo.style.zIndex = "1";
						nextVideo.style.zIndex = "2";
						activeRef.current = activeRef.current === 1 ? 2 : 1;
						transitionInProgress.current = false;
					}, fadeDuration);
				}).catch(error => {
					console.log("Video play failed:", error);
					transitionInProgress.current = false;
				});
			}
		};

		let animationFrame: number;
		const checkLoop = () => {
			checkTime();
			animationFrame = requestAnimationFrame(checkLoop);
		};

		animationFrame = requestAnimationFrame(checkLoop);

		return () => {
			cancelAnimationFrame(animationFrame);
		};
	}, []);

	return (
		<div className="relative w-full h-full aspect-video overflow-hidden">
			<video
				ref={videoRef1}
				muted
				playsInline
				className="absolute top-0 left-0 w-full h-full object-cover"
			>
				<source src={videoPath} type="video/mp4" />
			</video>
			<video
				ref={videoRef2}
				muted
				playsInline
				className="absolute top-0 left-0 w-full h-full object-cover"
			>
				<source src={videoPath} type="video/mp4" />
			</video>
		</div>
	);
}
