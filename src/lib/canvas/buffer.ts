export async function setupBuffer(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
): Promise<{ error: string | null }> {
	// Initialize buffers
	// Vertex Position
	const { error: vertexBufferError } = await createVertexBuffer(
		gl,
		program,
		'aVertexPosition',
	);

	if (vertexBufferError) {
		return { error: vertexBufferError };
	}

	// Initialize video texture
	const { error: videoTextureError } = await createVideoTexture(
		gl,
		program,
		'uFrame',
	);

	if (videoTextureError) {
		return { error: videoTextureError };
	}

	return { error: null };
}

export async function createVertexBuffer(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	name: string,
): Promise<{ error: string | null }> {
	// Two triangles stripes combined to create a rectangle
	const vertexPositions = new Float32Array([
		-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0,
	]);

	const vertexPositionsLoc = gl.getAttribLocation(program, name);

	if (vertexPositionsLoc < 0) {
		return { error: `Couldn't find attribute [${name}] location.` };
	}

	const vertexPositionBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);
	gl.vertexAttribPointer(
		vertexPositionsLoc,
		2, // (x, y)
		gl.FLOAT, // floating point numbers
		false, // normalize
		0, // stride
		0, // offset
	);
	gl.enableVertexAttribArray(vertexPositionsLoc);

	return { error: null };
}

export async function createVideoTexture(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	name: string,
): Promise<{ error: string | null }> {
	const samplerLoc = gl.getUniformLocation(program, name);

	if (!samplerLoc) {
		return { error: `Couldn't find sampler [${name}] location.` };
	}

	const texture = gl.createTexture();

	if (!texture) {
		return { error: 'Could not create texture.' };
	}

	gl.bindTexture(gl.TEXTURE_2D, texture);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	// flip video frame
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	return { error: null };
}
