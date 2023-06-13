import { onCleanup } from 'solid-js';

// Thank you. https://playground.solidjs.com/anonymous/0850d269-ca93-4a6d-9607-ca8c2aa2f0cb
export default function useDebounce(signalSetter, delay) {
	let timerHandle;
	function debouncedSignalSetter(value) {
		clearTimeout(timerHandle);
		timerHandle = setTimeout(() => signalSetter(value), delay);
	}
	onCleanup(() => clearInterval(timerHandle));
	return debouncedSignalSetter;
}
