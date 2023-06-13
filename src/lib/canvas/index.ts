import logger from '../store/log';
import { setupBuffer } from './buffer';
import { updateRuntimeUniform } from './runtime';
import { setupProgram } from './webgl';
import { Muxer, ArrayBufferTarget } from 'webm-muxer';

const V_SHADER = `#version 300 es
    
    // in
    in vec2 aVertexPosition;

    // out
    out highp vec2 aTextureCoord;

    void main() {
        aTextureCoord = (aVertexPosition + 1.0) / 2.0;
        
        gl_Position = vec4(aVertexPosition, 0, 1);
    }

`;

// hello-world.glsl
export const F_SHADER = `#version 300 es

precision highp float;

// in from pipeline
in highp vec2 aTextureCoord; // <x, y> (normalized by default)

// uniforms
uniform sampler2D uFrame; // current video frame
uniform float uTime; // current video time
uniform vec2 uResolution; // <width, height>

// out
out highp vec4 oColor;

void main() {
    highp vec4 texelColor = texture(uFrame, aTextureCoord);

    oColor = texelColor;
}`;

// TODO: implement throw Error(''), instead of object with error property

export async function setupVideoCanvas(
	canvas: HTMLCanvasElement,
	video: HTMLVideoElement,
	fragmentShader: string | undefined,
): Promise<{
	gl: WebGL2RenderingContext;
	program: WebGLProgram | null;
	error: string | null;
}> {
	const gl = canvas.getContext('webgl2', {
		willReadFrequently: true, // possible performance enhancement (haven't tested)?
		preserveDrawingBuffer: true, // needed for screenshot capture
		desynchronized: true,
	}) as WebGL2RenderingContext;

	if (!gl) {
		throw new Error('WebGL is not supported.');
	} else {
		logger.info('WebGL loaded.');
	}

	if (!gl.getContextAttributes().desynchronized) {
		logger.warn(
			'Low latency WebGL canvas is not supported. Video playback may lag or stutter.',
		);
	}

	const glDebug = gl.getExtension('WEBGL_debug_renderer_info');

	logger.info(
		`Renderer: [${gl.getParameter(glDebug.UNMASKED_RENDERER_WEBGL)}]`,
	);
	logger.info(`Vendor: [${gl.getParameter(glDebug.UNMASKED_VENDOR_WEBGL)}]`);

	// Sizing
	gl.canvas.width = video.videoWidth;
	gl.canvas.height = video.videoHeight;
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// Clear canvas
	gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Setup Program
	const { program, error: programError } = await setupProgram(
		gl,
		V_SHADER,
		fragmentShader || F_SHADER,
	);

	if (!program || programError) {
		return { gl, program: null, error: programError };
	}

	// Setup Buffers
	const { error: bufferError } = await setupBuffer(gl, program /*, video */);

	if (bufferError) {
		return { gl, program: null, error: bufferError };
	}

	return { gl, program, error: null };
}

export async function recompileCanvasShader(
	gl: WebGL2RenderingContext,
	// video: HTMLVideoElement,
	NEW_F_SHADER: string,
): Promise<{ program: WebGLProgram | null; error: string | null }> {
	const { program, error: programError } = await setupProgram(
		gl,
		V_SHADER,
		NEW_F_SHADER,
	);

	if (!program || programError) {
		return { program: null, error: programError };
	}

	// Setup Buffers
	const { error: bufferError } = await setupBuffer(gl, program /*, video */);

	if (bufferError) {
		return { program: null, error: bufferError };
	}

	return { program, error: null };
}

export function drawVideoFrame(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	video: HTMLVideoElement,
): /* Promise< */ void /* > */ {
	const level = 0;
	const internalFormat = gl.RGBA;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;

	// updateTimeUniform(gl, program, video.currentTime);

	updateRuntimeUniform(gl, program, [
		{
			name: 'uTime',
			value: [video.currentTime],
		},
		{
			name: 'uResolution',
			value: [video.videoWidth, video.videoHeight],
		},
	]);

	// video frame
	gl.texImage2D(
		gl.TEXTURE_2D,
		level,
		internalFormat,
		srcFormat,
		srcType,
		video,
	);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// TOOD: use mp4 instead.
// TODO: figure out a way to record a video WITHOUT having to watch the whole thing
export async function recordVideo(
	canvas: HTMLCanvasElement,
	video: HTMLVideoElement,
	controller: AbortController,
): Promise<{
	muxer: Muxer<ArrayBufferTarget>;
	videoEncoder: VideoEncoder;
	skip: boolean;
}> {
	const width = video.videoWidth,
		height = video.videoHeight,
		duration = video.duration;

	// setup
	const muxer = new Muxer({
		target: new ArrayBufferTarget(),
		video: {
			codec: 'V_VP9',
			width,
			height,
		},
	});

	const videoEncoder = new VideoEncoder({
		output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
		error: (error) => logger.error(error.message),
	});

	videoEncoder.configure({
		codec: 'vp09.00.10.08',
		width,
		height,
		// bitrate: 10e7 // 12.5 MB
		// bitrate: 8e6, // 1 MB
		bitrate: 7e6, // 875 KB
		// bitrate: 4e6, // 500 KB
		// bitrate: 1.2e6, // 150 KB
	});

	// frame encoding
	const stream = canvas.captureStream(0);
	const videoTrack = stream.getVideoTracks()[0];
	// @ts-expect-error
	const videoProcess: GenericTransformStream = new MediaStreamTrackProcessor(
		videoTrack,
	);
	const reader = videoProcess.readable.getReader();

	video.play();
	video.loop = false;

	let skip = false;

	window.addEventListener('blur', handleExit);
	document.addEventListener('visibilitychange', handleExit);
	controller.signal.addEventListener('abort', handleAbort);

	function handleExit() {
		if (document.visibilityState === 'hidden' && stream.active) {
			cleanup();
		}
	}

	function handleAbort() {
		skip = true;
		logger.warn('Recording stopped.');
		cleanup();
	}

	function cleanup() {
		reader.cancel();
		videoTrack.stop();

		video.loop = true;
		video.pause();

		controller.signal.removeEventListener('abort', cleanup);
		window.removeEventListener('blur', handleExit);
		document.removeEventListener('visibilitychange', handleExit);
	}

	// record
	while (
		video.currentTime !== duration &&
		!video.paused &&
		!document.hidden
	) {
		// @ts-expect-error
		videoTrack.requestFrame();
		const frame: VideoFrame = (await reader.read()).value;

		if (!frame) {
			break;
		}

		videoEncoder.encode(frame);
		frame.close();
	}

	cleanup();
	return { muxer, videoEncoder, skip };
}
