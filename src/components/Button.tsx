import type { ComponentProps } from 'solid-js';
import { splitProps } from 'solid-js';
import classList from '../lib/classList';

type ButtonProps = ComponentProps<'button'>;

export default function Button(_props: ButtonProps) {
	const [props, rest] = splitProps(_props, ['class', 'children', 'disabled']);
	return (
		<button
			type="button"
			disabled={props.disabled}
			class={classList(
				props.class,
				'rounded-full p-2 select-none flex items-center text-neutral-500',
			)}
			{...rest}
		>
			{props.children}
		</button>
	);
}
