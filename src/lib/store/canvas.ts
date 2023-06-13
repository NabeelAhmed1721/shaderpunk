import { createRoot, createSignal } from 'solid-js';

type CanvasState = {
	canvas: HTMLCanvasElement;
	gl: WebGL2RenderingContext;
	program: WebGLProgram;
};

// TODO: make individual `createSignals` for all `CanvasState`?
function createCanvasSignal() {
	const [canvasState, setCanvasState] = createSignal<CanvasState>();

	const setCanvas = (canvas: HTMLCanvasElement) => {
		setCanvasState((state) => ({ ...state, canvas }));
	};

	const setGL = (gl: WebGL2RenderingContext) => {
		setCanvasState((state) => ({ ...state, gl }));
	};

	const setProgram = (program: WebGLProgram) => {
		setCanvasState((state) => ({ ...state, program }));
	};

	return { canvasState, setCanvas, setGL, setProgram };
}

export default createRoot(createCanvasSignal);
