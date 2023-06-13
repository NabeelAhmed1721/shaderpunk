import { createRoot, createSignal } from 'solid-js';

// type VideoState = {
//     videoElement: HTMLVideoElement;
//     isPlaying: boolean;
//     progress: number;
//     duration: number;
//   };

// // TODO: expand API
// type VideoAction = {
//     setVideoElement: (videoElement: HTMLVideoElement) => void;
//     play: () => void;
//     pause: () => void;
//     setProgress: (progress: number) => void;
// };

function createRecordSignal() {
	const [isRecordingPaused, setRecordingPause] = createSignal(false);

	return { isRecordingPaused, setRecordingPause };
}

export default createRoot(createRecordSignal);

// function createVideoSignal() {
// 	return createSignal<HTMLVideoElement>();
// }

// export default createRoot(createVideoSignal);
