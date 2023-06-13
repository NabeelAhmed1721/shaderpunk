import { IoDownload } from 'solid-icons/io';
import Button from './Button';
import MenuWrapper, { MenuProps } from './MenuWrapper';

type RecordingPreviewMenuProps = MenuProps & {
	src: string;
};

export default function RecordingPreviewMenu(props: RecordingPreviewMenuProps) {
	function handleDownload() {
		const a = document.createElement('a');
		a.href = props.src;
		a.download = 'video.webm';
		a.click();
	}

	return (
		<div class="absolute left-0 flex w-full justify-center">
			<MenuWrapper isOpen={props.isOpen} onBlur={props.onBlur}>
				<div class="flex w-[608px] max-w-full flex-col gap-3 p-3">
					<div class="flex items-center justify-between">
						<h1>Recording Preview</h1>
						<Button
							class="hover:bg-green-950 hover:text-green-600"
							onClick={handleDownload}
						>
							Download
							<IoDownload size={16} class="ml-1 inline" />
						</Button>
					</div>
					<div class="flex-1">
						<video
							src={props.src}
							class="h-full max-h-full w-full max-w-full"
							controls
						/>
					</div>
				</div>
			</MenuWrapper>
		</div>
	);
}
