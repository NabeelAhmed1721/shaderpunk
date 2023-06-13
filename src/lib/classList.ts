/**
 * Returns a single string of a list of classNames
 * @argument classNames list of CSS Module classNames
 */
export default function classList(
	...classNames: (string | boolean | undefined | null)[]
): string {
	return classNames
		.filter((className) => typeof className === 'string')
		.join(' ')
		.trim();
}
