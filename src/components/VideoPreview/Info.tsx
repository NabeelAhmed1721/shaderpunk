import { Show } from 'solid-js';

type InfoProps = {
	video: HTMLVideoElement;
	videoWarnings: string[];
};

// TODO: add more stuff as needed here

export default function Info(props: InfoProps) {
	return (
		<>
			<div class="flex h-full items-center gap-2 text-neutral-500">
				{/* TODO: Add modal/popup to show a list of warnings */}
				<Show when={props.videoWarnings.length > 0}>
					<span class="rounded-full p-2 text-yellow-300 hover:bg-yellow-900">
						{props.videoWarnings.length} Warning
						{props.videoWarnings.length > 1 ? 's' : ''} (check
						console)
					</span>
				</Show>
				<span class="p-2">
					{props.video.videoWidth}x{props.video.videoHeight}
				</span>
			</div>
		</>
	);
}
