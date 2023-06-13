/**
 * This file contains runtime uniforms (expect for `uFrame` which is initialized on setup)
 */

/**
 * Updates a collection of runtime uniforms.
 */
export function updateRuntimeUniform(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	// TODO: find a better way to strongly type `value`, instead of `any[]`
	uniforms: { name: string; value: any[] }[],
) {
	for (const uniform of uniforms) {
		const uniformLocation = gl.getUniformLocation(program, uniform.name);
		switch (uniform.name) {
			case 'uTime':
				gl.uniform1f(uniformLocation, uniform.value[0]);
				break;
			case 'uResolution':
				gl.uniform2f(
					uniformLocation,
					uniform.value[0],
					uniform.value[1],
				);
				break;
		}
	}
}

// /**
//  * Sets the `uTime` uniform of the given program.
//  */
// export function updateTimeUniform(
//     gl: WebGL2RenderingContext,
//     program: WebGLProgram,
//     delta: number,
//   ) {
//     const timeLocation = gl.getUniformLocation(program, 'uTime');
//     gl.uniform1f(timeLocation, delta);
//   }
