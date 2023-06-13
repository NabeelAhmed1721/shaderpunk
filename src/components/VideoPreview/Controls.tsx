import { Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { IoImageOutline, IoPause, IoPlay } from 'solid-icons/io';
import type { EventHandler, MouseEventHandler } from '../../types/utility';
import Button from '../Button';
import storeCanvas from '../../lib/store/canvas';
import { RecordingState } from '../../App';
// import logger from '../../lib/store/log';

type VideoControlsProps = {
	video: /*Accessor<*/ HTMLVideoElement /*>*/;
	recordingState: RecordingState;
};

export default function Controls(props: VideoControlsProps) {
	let container: HTMLDivElement;
	let seeker: HTMLDivElement;
	const { canvasState } = storeCanvas;
	// let timestamp: HTMLDivElement;
	const [isVideoPlaying, setIsVideoPlaying] = createSignal(false);
	const [wasVideoPlaying, setVideoWasPlaying] = createSignal(false);
	const [isMouseDown, setMouseDown] = createSignal(false);
	const [containerRect, setContainerRect] = createSignal({
		left: 0,
		width: 0,
	});
	const [progress, setProgress] = createSignal(0);

	// https://stackoverflow.com/a/71544292/9851824
	const [isSeeking, setSeeking] = createSignal(false);
	const [isTicking, setTicking] = createSignal(false);

	// when video is recording save start of recording as percentage
	const [recordingStart, setRecordingStart] = createSignal(null);

	onMount(() => {
		calculateContainerRect();
	});

	createEffect(() => {
		if (props.recordingState == 'recording') {
			const video = props.video;
			video.pause();
			const currentTime = video.currentTime;
			const duration = video.duration;

			const percentage = currentTime / duration;
			setRecordingStart(percentage);
		}

		if (props.recordingState == 'not-recording') {
			setRecordingStart(null);
		}
	});

	// createEffect(() => {
	// 	if (isMouseDown()) {
	// 		timestamp.style.display = "block";
	// 	} else {
	// 		timestamp.style.display = "";
	// 	}
	// })

	function downloadFrame() {
		// download current frame of canvas
		const url = canvasState().canvas.toDataURL('image/png');
		const a = document.createElement('a');
		a.href = url;
		a.download = 'frame.png';
		a.click();
	}

	function handleMouseMove(event: MouseEventHandler<HTMLDivElement>) {
		if (isMouseDown() && !isTicking()) {
			window.requestAnimationFrame(() => {
				setVideoProgress(event);
				setTicking(false);
			});
			setTicking(true);
		}

		if (event.currentTarget == container) {
			// only update seek if mouse movement is inside container
			updateSeekLocation(event);
		}
	}

	// Fired by the container
	function handleMouseDown() {
		setVideoWasPlaying(!props.video.paused);

		props.video.pause();
		setMouseDown(true);
	}

	// Fired globally
	function handleMouseUp() {
		if (!isMouseDown()) {
			return;
		}

		if (wasVideoPlaying()) {
			props.video.play();
		}
		setMouseDown(false);
	}

	function updateSeekLocation(event: MouseEventHandler<HTMLDivElement>) {
		const { clientX } = event;
		const { left, width } = containerRect();
		const x = Math.min(Math.max(clientX - left, 0), width);
		seeker.style.width = `${x}px`; // update seeker width
		// timestamp.style.left = `${x - timestamp.clientWidth / 2}px`; // update timestamp left
		// timestamp.innerText = new String(x);
	}

	function getVideoProgress({
		currentTarget,
	}: EventHandler<HTMLVideoElement, Event>) {
		if (isMouseDown()) {
			return;
		}

		const { currentTime, duration } = currentTarget;
		const { width } = containerRect();
		const percentage = currentTime / duration;

		setProgress(width * percentage);
	}

	function getVideoPlaying({
		currentTarget,
	}: EventHandler<HTMLVideoElement, Event>) {
		setIsVideoPlaying(!currentTarget.paused);
	}

	function setVideoProgress(event: MouseEventHandler<HTMLDivElement>) {
		const { clientX } = event;
		const { left, width } = containerRect();
		const x = Math.min(Math.max(clientX - left, 0), width);

		setProgress(x);

		const percentage = x / width;
		const progress = percentage * props.video.duration;

		// timestamp.style.left = `${x - timestamp.clientWidth / 2}px`; // update timestamp left
		// timestamp.innerText = new Date(progress);

		// -0.00001 is a hacky fix for looping video showing first frame of video when currentTime = duration
		if (!isSeeking()) {
			props.video.currentTime = progress - 0.00001;
		}
	}

	function calculateContainerRect() {
		const { width: oldWidth } = containerRect();
		const progressRatio = progress() / oldWidth;
		const { left, width } = container.getBoundingClientRect();
		setContainerRect({ left, width });
		setProgress(progressRatio * width);
	}

	function setSeekingTrue() {
		setSeeking(true);
	}

	function setSeekingFalse() {
		setSeeking(false);
	}

	function handleKeyDown(event) {
		// check if editor is not in focused first
		if (document.activeElement.classList.contains('cm-content')) {
			return;
		}

		if (event.key === ' ') {
			// const v = video();
			// v.paused ? v.play() : v.pause();
			props.video.paused ? props.video.play() : props.video.pause();
		}
	}

	createEffect(() => {
		const video = props.video;

		video.addEventListener('timeupdate', getVideoProgress);
		video.addEventListener('play', getVideoPlaying);
		video.addEventListener('pause', getVideoPlaying);
		video.addEventListener('seeking', setSeekingTrue);
		video.addEventListener('seeked', setSeekingFalse);

		onCleanup(() => {
			video.removeEventListener('timeupdate', getVideoProgress);
			video.removeEventListener('play', getVideoPlaying);
			video.removeEventListener('pause', getVideoPlaying);
			video.removeEventListener('seeking', setSeekingTrue);
			video.removeEventListener('seeked', setSeekingFalse);
		});
	});

	window.addEventListener('resize', calculateContainerRect);
	window.addEventListener('mousemove', handleMouseMove);
	window.addEventListener('mouseup', handleMouseUp);
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('blur', handleMouseUp);

	onCleanup(() => {
		window.removeEventListener('resize', calculateContainerRect);
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('blur', handleMouseUp);
	});

	return (
		<>
			<div
				// disable controls when recording or loading
				{...(props.recordingState === 'not-recording' && {
					onMouseMove: handleMouseMove,
					onMouseDown: handleMouseDown,
					onClick: setVideoProgress,
				})}
				class="group relative flex h-3 w-full cursor-pointer select-none items-center"
				ref={container}
				// onMouseMove={handleMouseMove}
				// onMouseDown={handleMouseDown}
				// onClick={setVideoProgress}
			>
				<div class="absolute h-[3px] w-full bg-neutral-700 group-hover:h-2" />
				<Show when={props.recordingState === 'not-recording'}>
					<div
						class="absolute hidden h-[3px] bg-neutral-600 group-hover:block group-hover:h-2"
						ref={seeker}
					/>
				</Show>
				<Show
					when={
						props.recordingState === 'not-recording' ||
						recordingStart() === null
					}
					fallback={
						// disable when recording or loading
						<div
							class="absolute h-[3px] w-[12px] bg-red-600 group-hover:h-[6px]"
							style={{
								left: `${
									recordingStart() * containerRect().width
								}px`,
								width: `${
									progress() -
									recordingStart() * containerRect().width
								}px`,
							}}
						/>
					}
				>
					<div
						class="absolute h-[3px] w-[12px] bg-neutral-100 group-hover:h-[6px]"
						style={{
							width: `${progress()}px`,
						}}
					/>
				</Show>
				<Show when={props.recordingState === 'not-recording'}>
					<div
						class="absolute hidden h-3 w-3 rounded-full bg-neutral-100 group-hover:block"
						style={{
							left: `${progress() - 12 / 2}px`,
						}}
					/>
				</Show>
				{/* <div class="absolute bottom-4 hidden group-hover:block " ref={timestamp} /> */}
			</div>
			<div class="mt-1 flex items-center justify-between">
				<button
					class="rounded-full p-2 hover:bg-neutral-700"
					onClick={({ currentTarget }) => {
						currentTarget.blur(); // prevent spacebar from triggering play/pause
						// const v = video();
						// v.paused ? v.play() : v.pause();
						props.video.paused
							? props.video.play()
							: props.video.pause();
					}}
				>
					<Show
						when={isVideoPlaying()}
						fallback={<IoPlay size={16} />}
					>
						<IoPause size={16} />
					</Show>
				</button>
				<div>
					<Show when={props.recordingState === 'not-recording'}>
						<Button
							class="p-2 hover:bg-neutral-700 hover:text-neutral-100"
							onClick={downloadFrame}
						>
							Download Frame
							<IoImageOutline size={16} class="ml-1 inline" />
						</Button>
					</Show>
				</div>
			</div>
		</>
	);
}
