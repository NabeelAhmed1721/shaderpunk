import logger from './store/log';

type VideoPayload = {
	video: HTMLVideoElement;
	warnings: string[];
};

export default async function createVideo(url: string): Promise<VideoPayload> {
	const video = document.createElement('video');
	video.src = url;
	video.loop = true;
	// video.loop = false;
	video.muted = true; // TODO: fix audio
	video.preload = 'metadata';
	video.currentTime = 0;
	video.playbackRate = 1;
	// video.play();
	video.pause();

	return new Promise((resolve, reject) => {
		video.onloadedmetadata = () => {
			const warnings = getVideoWarnings(video);

			resolve({ video, warnings });
		};
		video.onerror = (error) => reject(error);
	});
}

function getVideoWarnings(video: HTMLVideoElement): string[] {
	const warnings = [];

	// TODO: Webm "infinity" duration possible fix: https://stackoverflow.com/questions/21522036/html-audio-tag-duration-always-infinity
	// https://github.com/mat-sz/webm-fix-duration#example
	if (video.duration === Infinity) {
		warnings.push(
			'Unable to determine video file duration. This may cause unexpected behavior with playback and recording.',
		);
	}

	// log every warning
	warnings.forEach((warning) => logger.warn(warning));

	return warnings;
}
