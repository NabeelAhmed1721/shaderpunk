import { Motion, Presence } from '@motionone/solid';
import type { JSXElement } from 'solid-js';
import { createSignal, Show, onCleanup, createEffect } from 'solid-js';
import { MouseEventHandler } from '../types/utility';
import classList from '../lib/classList';

export type MenuProps = {
	isOpen: boolean;
	onBlur?: () => void;
	class?: string;
};

type MenuWrapperProps = MenuProps & {
	children: JSXElement;
};

export default function MenuWrapper(props: MenuWrapperProps) {
	let container: HTMLDivElement;
	// menu may be "open" but invisible due to animation time
	const [isVisible, setVisible] = createSignal(false);

	createEffect(() => {
		if (props.isOpen) {
			window.addEventListener('click', handleGlobalMouse);
		} else {
			window.removeEventListener('click', handleGlobalMouse);
		}
	});

	function handleGlobalMouse(event: MouseEventHandler<Window>) {
		// trigger onBlur when clicked outside of menu
		if (container && !container.contains(event.target) && isVisible()) {
			props.onBlur();
		}
	}

	onCleanup(() => {
		window.removeEventListener('click', handleGlobalMouse);
	});

	return (
		<Presence>
			<Show when={props.isOpen}>
				<Motion.div
					initial={{ opacity: 0, y: -12 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -12 }}
					transition={{ duration: 0.2 }}
					onMotionComplete={() => setVisible(props.isOpen)}
					class={classList(
						props.class,
						'absolute max-w-full border border-neutral-700 bg-neutral-800/90 backdrop-blur-sm rounded-xl z-10 overflow-hidden',
					)}
					ref={container}
				>
					{props.children}
				</Motion.div>
			</Show>
		</Presence>
	);
}
