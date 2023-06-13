import { DOMElement } from 'solid-js/jsx-runtime';

// idk why this isn't included in solid-js
// maybe it is. but I can't find it.
// adapted from https://github.com/ryansolid/dom-expressions/blob/679bf6d4d88517c6d7c57eca7dbcced1cd538fd7/packages/dom-expressions/src/jsx.d.ts#LL23C1-L30C4
type EventHandler<T, E extends Event> = E & {
	currentTarget: T;
	target: DOMElement;
};

type MouseEventHandler<T> = EventHandler<T, MouseEvent>;
