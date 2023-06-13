import type { ComponentProps } from 'solid-js';
import { createSignal, splitProps } from 'solid-js';
import logger from '../lib/store/log';
import { EventHandler } from '../types/utility';
import classList from '../lib/classList';

type FileInputEvent = Event & { target: HTMLInputElement };
type DragHandler = EventHandler<HTMLDivElement, DragEvent>;

type UploadProps = {
	onChange?: (filename: string) => void;
};

export default function Upload(props: UploadProps) {
	let input: HTMLInputElement;

	const [isFileDragging, setFileDragging] = createSignal(false);

	function handleFile(file: File) {
		const fileUrl = URL.createObjectURL(file);
		logger.info(`File \`${file.name}\` selected.`);
		return props.onChange(fileUrl);
	}

	function isVideoFile(file: File): boolean {
		const mimeType = file.type;

		// verify file is a video
		if (mimeType.match(/video\/*/g) === null) {
			logger.error(`File \`${file.name}\` is not a video.`);
			return false;
		}

		return true;
	}

	function handleFileSelect(event: FileInputEvent) {
		if (!event.target.files || event.target.files.length === 0) {
			return;
		}

		const file = event.target.files[0];

		if (!isVideoFile(file)) {
			return;
		}

		handleFile(file);
	}

	function handleFileDialog() {
		input.click();
	}

	function handleFileDragging(event: DragHandler) {
		event.preventDefault();
		setFileDragging(true);
	}

	function handleFileLeave(event: DragHandler) {
		event.preventDefault();

		if (event.currentTarget.contains(event.relatedTarget as Node)) {
			return;
		}

		setFileDragging(false);
	}

	function handleFileDrop(event: DragHandler) {
		event.preventDefault();
		const file = event.dataTransfer.files[0];

		if (!isVideoFile(file)) {
			return;
		}

		handleFile(file);
	}

	return (
		<div
			class={classList(
				'w-full h-full flex justify-center items-center select-none',
				isFileDragging() ? 'bg-neutral-700' : '',
			)}
			onDragOver={handleFileDragging}
			onDragEnter={handleFileDragging}
			onDragLeave={handleFileLeave}
			onDrop={(event) => {
				handleFileDrop(event);
				handleFileLeave(event);
			}}
		>
			<div
				class="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl p-3 text-center hover:bg-neutral-700"
				onClick={handleFileDialog}
			>
				<IoVideocamOutline size={85} />
				<p>
					<span class="underline">Click here</span> select or drag and
					drop a video file.
				</p>
				<p>Files are never uploaded to any server.</p>
				<input
					class="hidden"
					type="file"
					onChange={handleFileSelect}
					ref={input}
					accept="video/mp4,video/x-m4v,video/*"
				/>
			</div>
		</div>
	);
}

// solid-icons was giving me a tough time with stroke-width of this icon
function IoVideocamOutline(_props: ComponentProps<'svg'> & { size: number }) {
	const [props, rest] = splitProps(_props, ['size']);
	return (
		<svg
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 512 512"
			height={props.size}
			width={props.size}
			style={{ overflow: 'visible', color: 'currentcolor' }}
			{...rest}
		>
			<title>Video Icon</title>
			<path
				fill="none"
				vector-effect="non-scaling-stroke"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M374.79 308.78L457.5 367a16 16 0 0022.5-14.62V159.62A16 16 0 00457.5 145l-82.71 58.22A16 16 0 00368 216.3v79.4a16 16 0 006.79 13.08z"
			/>
			<path
				fill="none"
				vector-effect="non-scaling-stroke"
				stroke="currentColor"
				stroke-miterlimit="10"
				d="M268 384H84a52.15 52.15 0 01-52-52V180a52.15 52.15 0 0152-52h184.48A51.68 51.68 0 01320 179.52V332a52.15 52.15 0 01-52 52z"
			/>
		</svg>
	);
}
