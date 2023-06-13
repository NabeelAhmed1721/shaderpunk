import logger from '../../lib/store/log';
import storeCanvas from '../../lib/store/canvas';
import {
	recompileCanvasShader,
	drawVideoFrame,
	setupVideoCanvas,
} from '../../lib/canvas';

import { createEffect, on, onCleanup, onMount } from 'solid-js';
// import type { Accessor } from 'solid-js';
import { Button } from '../';
import Controls from './Controls';
import { IoArrowBack } from 'solid-icons/io';
import Info from './Info';
import { RecordingState } from '../../App';
import { Motion } from '@motionone/solid';

type VideoPreviewProps = {
	video: HTMLVideoElement;
	videoWarnings: string[];
	onVideoClose: () => void;
	fragmentShader: string;
	recordingState: RecordingState;
};

export default function VideoPreview(props: VideoPreviewProps) {
	let canvas: HTMLCanvasElement;
	let frame: number;
	const fragmentShader = () => props.fragmentShader;
	const { canvasState, setCanvas, setGL, setProgram } = storeCanvas;

	onMount(() => {
		setup(canvas, props.video)
			.then(() => logger.info('Canvas ready.'))
			.catch(logger.error);
	});

	createEffect(
		on(
			fragmentShader,
			async (shader) => {
				// try setup again if `canvasState` isn't initialized
				if (!canvasState() || !canvasState().gl) {
					setup(canvas, props.video)
						.then(() => logger.info('Canvas ready.'))
						.catch(logger.error);
					return;
				}

				const { gl } = canvasState();

				const { program, error } = await recompileCanvasShader(
					gl,
					shader,
				);

				if (error) {
					logger.error(error);
					return;
				}

				setProgram(program);
				return drawVideoFrame(gl, program, props.video);
			},
			{ defer: true },
		),
	);

	function handleContextLost() {
		// TODO: fix this... possible memory leak?
		// https://stackoverflow.com/questions/25219352/webgl-scene-doest-render-because-of-lost-context
		logger.error('WebGL context lost :(. Choose your video again.');
		props.onVideoClose();
	}

	async function setup(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
		const { gl, program, error } = await setupVideoCanvas(
			canvas,
			video,
			props.fragmentShader,
		);

		if (error) {
			// logger.error(error);
			throw error;
		}

		setCanvas(canvas);
		setGL(gl);
		setProgram(program);

		canvas.addEventListener('webglcontextlost', handleContextLost);

		// render first frame
		video.play();
		video.currentTime = 0;
		drawVideoFrame(gl, program, video);
		video.pause();

		frame = requestAnimationFrame(render);
	}

	function render(/*now: number*/) {
		const { gl, program } = canvasState();

		drawVideoFrame(gl, program, props.video);
		frame = requestAnimationFrame(render);
	}

	onCleanup(() => {
		logger.warn('Cleaning up canvas.');
		cancelAnimationFrame(frame);
		canvas.removeEventListener('webglcontextlost', handleContextLost);
	});

	return (
		<div class="flex h-full w-full flex-col">
			<div class="relative flex h-14 items-center justify-between p-3">
				<Button
					class="hover:bg-neutral-700 hover:text-neutral-100"
					onClick={props.onVideoClose}
				>
					<IoArrowBack class="mr-1 inline" /> Choose file
				</Button>
				<Info video={props.video} videoWarnings={props.videoWarnings} />
			</div>
			<div class="relative flex-1">
				<Motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					// TODO: exit animations don't work.
					// possible reason? https://motion.dev/solid/presence#:~:text=Presence%20currently%20only%20supports%20a%20single%20rendered%20child.
					exit={{ opacity: 0, scale: 0.95 }}
					transition={{ duration: 0.2 }}
					class="absolute flex h-full w-full items-center justify-center"
				>
					<canvas
						class="max-h-full max-w-full cursor-pointer select-none"
						onClick={() => {
							props.video.paused
								? props.video.play()
								: props.video.pause();
						}}
						ref={canvas}
					/>
				</Motion.div>
			</div>
			<div class="p-3">
				<Controls
					video={props.video}
					recordingState={props.recordingState}
				/>
			</div>
		</div>
	);
}
