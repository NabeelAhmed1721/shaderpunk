import logger from '../store/log';

/**
 * Compiles vertex and fragment shaders and links a  program.
 * @returns The program with vertex and fragment shaders attached and any errors.
 */
export async function setupProgram(
	gl: WebGL2RenderingContext,
	vertexShaderSource: string,
	fragmentShaderSource: string,
): Promise<{ program: WebGLProgram | null; error: string | null }> {
	// VERTEX SHADER
	const { shader: vertexShader, error: vertexShaderError } =
		await createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

	if (vertexShaderError) {
		return { program: null, error: vertexShaderError };
	}

	logger.info('Compiled vertex shader.');

	// FRAGMENT SHADER
	const { shader: fragmentShader, error: fragmentShaderError } =
		await createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

	if (fragmentShaderError) {
		return { program: null, error: fragmentShaderError };
	}

	logger.info('Compiled fragment shader.');

	// PROGRAM
	const { program, error: programError } = await createProgram(
		gl,
		vertexShader,
		fragmentShader,
	);

	if (programError) {
		return { program: null, error: programError };
	}

	logger.info('Created program.');

	return { program, error: null };
}

/**
 * Creates, links and enables a program.
 * @returns The program and any errors.
 */
export async function createProgram(
	gl: WebGL2RenderingContext,
	vertexShader: WebGLShader,
	fragmentShader: WebGLShader,
): Promise<{ program: WebGLProgram; error: string | null }> {
	const program = gl.createProgram();

	if (!program) {
		throw new Error('Program could not be created.');
	}

	await gl.attachShader(program, vertexShader);
	await gl.attachShader(program, fragmentShader);
	await gl.linkProgram(program);
	await gl.useProgram(program);

	const result = gl.getProgramParameter(program, gl.LINK_STATUS);

	if (result) {
		return { program, error: null };
	} else {
		return { program, error: gl.getProgramInfoLog(program) };
		// throw new Error('Program could not be linked.');
	}
}

/**
 * Creates and compiles a shader.
 * @returns The shader and any errors.
 */
export async function createShader(
	gl: WebGL2RenderingContext,
	type: GLenum,
	source: string,
): Promise<{ shader: WebGLShader; error: string | null }> {
	const shader = gl.createShader(type);

	if (!shader) {
		throw new Error('Shader could not be created.');
	}

	await gl.shaderSource(shader, source);
	await gl.compileShader(shader);

	const result = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

	if (result) {
		return { shader, error: null };
	} else {
		return { shader, error: gl.getShaderInfoLog(shader) };
	}
}
