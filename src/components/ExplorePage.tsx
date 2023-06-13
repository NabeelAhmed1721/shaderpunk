import { For, createSignal } from 'solid-js';
import logger from '../lib/store/log';
import classList from '../lib/classList';
import shaders from '../shader-presets.json';

// TODO: host this in a remote location; a database.
// const shaders = [
//     {
//         name: "Hello World",
//         url: '/shader/hello-world.glsl',
//         thumbnail: "/image/shaderthumbnail/hello-world.webp"
//     },
//     {
//         name: "Ordered Dithering",
//         url: "/shader/ordered-dithering.glsl",
//         thumbnail: "/image/shaderthumbnail/ordered-dithering.webp"
//     },

// ];

type ExplorePageProps = {
	onSelect: (code: string) => void;
	disabled: boolean;
};

export default function ExplorePage(props: ExplorePageProps) {
	const [selectedShader, setSelectedShader] = createSignal();

	function handleShaderSelect(name: string, url: string) {
		fetch(url)
			.then((response) => response.text())
			.then(props.onSelect)
			.then(() => logger.info(`Loaded shader: ${name}`))
			.catch(logger.error);
	}

	return (
		<div
			class="grid gap-3 p-3 md:grid-cols-2 lg:grid-cols-3"
			aria-disabled={props.disabled}
		>
			<For each={shaders}>
				{({ name, url, thumbnail }, index) => (
					<button
						class={classList(
							'bg-neutral-700 h-24 rounded-xl flex justify-center items-center relative overflow-hidden',
							selectedShader() === index() &&
								'outline outline-1 outline-neutral-100', // gradient merging into background image
						)}
						disabled={
							selectedShader() === index() || props.disabled
						}
						onClick={() => {
							handleShaderSelect(name, url);
							setSelectedShader(index());
						}}
					>
						<img
							src={thumbnail}
							class="absolute h-full w-full object-cover"
							alt={name + ' demo'}
						/>
						<span class="relative flex h-full w-full items-center justify-center bg-neutral-700/75">
							{name}
						</span>
					</button>
				)}
			</For>
		</div>
	);
}
