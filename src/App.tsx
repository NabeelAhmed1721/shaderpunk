import {
	Button,
	Console,
	Editor,
	ExplorePage,
	MainMenu,
	RecordingPreviewMenu,
	Upload,
	VideoPreview,
} from './components';
import {
	IoArrowUndoCircle,
	IoChevronDown,
	IoChevronUp,
	IoCodeSlashOutline,
	IoEllipse,
	IoEllipseOutline,
	IoSparklesOutline,
	IoSquare,
} from 'solid-icons/io';
import logger from './lib/store/log';
import storeCanvas from './lib/store/canvas';
import { createSignal, Match, Show, Switch } from 'solid-js';
import createVideo from './lib/createVideo';
import useDebounce from './lib/useDebounce';
import { F_SHADER, recordVideo } from './lib/canvas';

// Video by Nicky Pe: https://www.pexels.com/video/a-colorful-lepidoptera-on-the-flower-7855586/

export type RecordingState = 'recording' | 'not-recording' | 'loading';

function App() {
	const { canvasState } = storeCanvas;

	// video
	const [video, setVideo] = createSignal<HTMLVideoElement>();
	const [videoWarnings, setVideoWarnings] = createSignal<string[]>([]);

	// current shader
	const [fragmentShader, setFragmentShader] = createSignal<string>(F_SHADER);
	const debounceFragmentShader = useDebounce(setFragmentShader, 750);

	// recording
	const [recordedVideo, setRecordedVideo] = createSignal<string>();
	const [recordingState, setRecordingState] =
		createSignal<RecordingState>('not-recording');
	const [recordingController, setRecodingController] =
		createSignal<AbortController>();

	// menu toggles
	const [isExploreMenuOpen, setExploreMenuOpen] = createSignal(false);
	const [isMainMenuOpen, setMainMenuOpen] = createSignal(false);
	const [isRecordingPreviewMenuOpen, setRecordingPreviewMenuOpen] =
		createSignal(false);

	// onMount(() => {
	// 	video()?.remove();
	// 	createVideo("/test.mp4").then(setVideo).catch(logger.error);
	// })

	function handleVideoUpload(src: string) {
		createVideo(src)
			.then(({ video, warnings }) => {
				setVideo(video);
				setVideoWarnings(warnings);
				return;
			})
			.catch(logger.error);
	}

	function handleVideoClose() {
		if (recordingState() === 'recording') {
			recordingController()?.abort(); // abort any current recording
		}
		setRecordingState('not-recording');
		video()?.remove();
		setVideo(null);
	}

	function handleRecord() {
		if (!video()) return;
		setRecordingState('recording');
		logger.info('Recording...');

		const firstTime =
			sessionStorage.getItem('recording-warning') !== 'true';

		if (firstTime) {
			logger.warn(
				'Due to browser limitations, Shaderpunk does not support background recording. ' +
					'If you switch tabs in your browser, recording will stop and the video may freeze. ' +
					'To avoid this issue, please keep the tab open while recording lengthy or high-quality clips. ' +
					'I apologize for any inconvenience this may cause. If you have any suggestions or feedback, ' +
					'please feel free to reach out to me.',
			);

			sessionStorage.setItem('recording-warning', 'true');
		}

		const controller = new AbortController(),
			currentRecodedURL = recordedVideo();

		setRecodingController(controller);

		recordVideo(canvasState().canvas, video(), controller)
			.then(async ({ muxer, videoEncoder, skip }) => {
				if (skip) return;

				setRecordingState('loading');
				await videoEncoder.flush();
				muxer.finalize();
				return muxer.target.buffer;
			})
			.then((buffer) => {
				if (!buffer) return;

				// TODO: support for mp4
				const blob = new Blob([buffer], { type: 'video/webm' });
				// Remove previous recording blob urls
				// https://stackoverflow.com/a/49346614/9851824
				if (currentRecodedURL) URL.revokeObjectURL(currentRecodedURL);

				const url = URL.createObjectURL(blob);
				logger.info('Recording complete.');
				// logger.info('Video URL: ' + url);
				setRecordedVideo(url);
				// window.open(url);
				setRecordingPreviewMenuOpen(true);
				return url;
			})
			.catch(logger.error)
			.finally(() => {
				setRecordingState('not-recording');
			})
			.catch(logger.error);
	}

	return (
		<main class="flex h-screen w-screen flex-col overflow-hidden text-xs">
			{/* header */}
			<div class="flex h-12 w-full items-center border-b border-b-neutral-700 px-6 py-2">
				<div class="flex flex-1 justify-start">
					<Show
						when={!isExploreMenuOpen()}
						fallback={
							<Button
								class="hover:bg-green-950 hover:text-green-600"
								onClick={() => setExploreMenuOpen(false)}
							>
								<IoCodeSlashOutline class="mr-1 inline" /> Code
								Editor
							</Button>
						}
					>
						<Button
							class="hover:bg-green-950 hover:text-green-600"
							onClick={() => setExploreMenuOpen(true)}
						>
							<IoSparklesOutline class="mr-1 inline" /> Explore
						</Button>
					</Show>
				</div>
				<div class="relative flex flex-1 justify-center">
					<Button
						class="hover:bg-neutral-800 hover:text-neutral-100"
						onClick={() => setMainMenuOpen((state) => !state)}
					>
						Shaderpunk{' '}
						<Show
							when={!isMainMenuOpen()}
							fallback={<IoChevronUp class="ml-1 inline" />}
						>
							<IoChevronDown class="ml-1 inline" />
						</Show>
					</Button>
				</div>
				<div class="flex flex-1 justify-end">
					<Switch>
						<Match when={recordingState() === 'recording'}>
							<Button
								class="hover:bg-red-950 hover:text-red-600"
								onClick={() => video().pause()}
							>
								Stop Recording <IoSquare class="ml-1 inline" />
							</Button>
						</Match>
						<Match when={recordingState() === 'loading'}>
							<Button class="hover:text-red-600" disabled>
								Encoding{' '}
								<IoEllipseOutline class="ml-1 inline" />
							</Button>
						</Match>
						<Match
							when={
								video() && recordingState() === 'not-recording'
							}
						>
							<Show when={recordedVideo()}>
								<Button
									class="mr-1 hover:bg-neutral-700 hover:text-neutral-100"
									onClick={() =>
										setRecordingPreviewMenuOpen(true)
									}
								>
									View Last Recording
									<IoArrowUndoCircle class="ml-1 inline" />
								</Button>
							</Show>
							<Button
								class="hover:bg-red-950 hover:text-red-600"
								onClick={handleRecord}
							>
								Record <IoEllipse class="ml-1 inline" />
							</Button>
						</Match>
					</Switch>
				</div>
			</div>
			{/* program ui */}
			<div class="relative flex w-full flex-1 gap-3 p-3">
				<RecordingPreviewMenu
					src={recordedVideo()}
					isOpen={isRecordingPreviewMenuOpen()}
					onBlur={() => setRecordingPreviewMenuOpen(false)}
				/>
				<MainMenu
					isOpen={isMainMenuOpen()}
					onBlur={() => setMainMenuOpen(false)}
				/>
				<div class="max-w-xl flex-1 rounded-xl border border-neutral-700 p-3">
					<div class="relative h-full w-full overflow-auto bg-neutral-800">
						<div class="absolute h-full w-full">
							<Show
								when={!isExploreMenuOpen()}
								fallback={
									<ExplorePage
										onSelect={setFragmentShader}
										disabled={
											recordingState() !== 'not-recording'
										}
									/>
								}
							>
								<Editor
									value={fragmentShader()}
									onChange={debounceFragmentShader}
									readOnly={
										recordingState() !== 'not-recording'
									}
								/>
							</Show>
						</div>
					</div>
				</div>
				<div class="flex-1 rounded-xl border border-neutral-700 p-3">
					<div class="flex h-full w-full flex-col gap-3">
						<div class="relative flex-1 bg-neutral-800">
							<Show
								when={video()}
								fallback={
									<Upload onChange={handleVideoUpload} />
								}
							>
								<VideoPreview
									video={video()}
									videoWarnings={videoWarnings()}
									onVideoClose={handleVideoClose}
									fragmentShader={fragmentShader()}
									recordingState={recordingState()}
								/>
							</Show>
						</div>
						<div class="max-h-40 flex-1 overflow-auto bg-neutral-800 p-3">
							<Console />
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}

export default App;
