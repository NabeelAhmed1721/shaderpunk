import { CodeMirror } from '@solid-codemirror/codemirror';
import { EditorView, keymap } from '@codemirror/view';
import {
	HighlightStyle,
	StreamLanguage,
	syntaxHighlighting,
	indentUnit,
} from '@codemirror/language';
import { basicSetup } from 'codemirror';
import { indentWithTab } from '@codemirror/commands';
import { shader } from '@codemirror/legacy-modes/mode/clike';
import { tags as t } from '@lezer/highlight';

const chalky = '#FDBA74'; // Orange 300
const coral = '#F87171'; // Red 400
const cyan = '#56b6c2';
const invalid = '#ffffff';
const ivory = '#abb2bf';
const stone = '#737373'; // Neutral 500
const malibu = '#61afef';
const sage = '#98c379';
const whiskey = '#d19a66';
const violet = '#C084FC'; // Purple 400

const darkBackground = '#262626'; // Neutral 900
const highlightBackground = '#404040'; // Neutral 700
const background = '#262626'; // Neutral 800
const tooltipBackground = '#171717'; // Neutral 900
const activeLine = 'rgba(64,64,64, 0.3)'; // Neutral 700"
const selection = '#404040'; // Neutral 700
const cursor = '#528bff';

// adopted/extended from oneDark
// https://github.com/codemirror/theme-one-dark/blob/1e54a0f3ed90988ffb791dfc33591f4e3a431c7f/src/one-dark.ts#LL46C1-L112C1
const theme = EditorView.theme(
	{
		'&': {
			color: ivory,
			backgroundColor: background,
			width: '100%',
			maxWidth: '100%',
			// fontSize: "18px",
			// TODO: Find a better way to do this?
			// screen height minus header minus two layers of padding minus extra pixels
			height: 'calc(100vh - 56px - (12px * 2) - (12px * 2) + 4px)',
		},
		'.cm-content': {
			paddingRight: '8px',
			caretColor: cursor,
		},
		'.cm-cursor, .cm-dropCursor': {
			borderLeftColor: cursor,
		},
		'&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
			{
				backgroundColor: selection,
			},
		'.cm-panels': {
			backgroundColor: darkBackground,
			color: ivory,
		},
		// ".cm-panels.cm-panels-top": {
		// 	borderBottom: "2px solid black",
		// },
		// ".cm-panels.cm-panels-bottom": {
		// 	borderTop: "2px solid black",
		// },
		'.cm-panel.cm-search': {
			borderTop: '1px solid rgb(64 64 64)',
			padding: '8px',
		},
		'.cm-searchMatch': {
			backgroundColor: '#72a1ff59',
			outline: '1px solid #457dff',
		},
		'.cm-searchMatch.cm-searchMatch-selected': {
			backgroundColor: '#6199ff2f',
		},
		'.cm-activeLine': {
			backgroundColor: activeLine,
		},
		'.cm-selectionMatch': {
			backgroundColor: '#aafe661a',
		},
		'&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket':
			{
				backgroundColor: '#bad0f847',
			},
		'.cm-gutters': {
			backgroundColor: background,
			color: stone,
			border: 'none',
			borderRight: '1px solid rgb(64 64 64)',
			marginRight: '8px',
			userSelect: 'none',
		},
		'.cm-activeLineGutter': {
			backgroundColor: highlightBackground,
		},
		'.cm-foldPlaceholder': {
			backgroundColor: 'transparent',
			border: 'none',
			color: '#ddd',
		},
		'.cm-tooltip': {
			border: 'none',
			borderRadius: '8px',
			backgroundColor: 'rgba(38, 38, 38, 0.80)',
			backdropFilter: 'blur(4px)',
			padding: '8px',
		},
		'.cm-tooltip .cm-tooltip-arrow:before': {
			borderTopColor: 'transparent',
			borderBottomColor: 'transparent',
		},
		'.cm-tooltip .cm-tooltip-arrow:after': {
			borderTopColor: tooltipBackground,
			borderBottomColor: tooltipBackground,
		},
		'.cm-tooltip-autocomplete': {
			'& > ul > li': {
				marginRight: '12px',
			},
			'& > ul > li[aria-selected]': {
				backgroundColor: highlightBackground,
				color: ivory,
			},
			'& > ul > li:hover': {
				backgroundColor: highlightBackground,
				color: ivory,
			},
		},

		// Animate caret movement
		'.cm-cursor-primary': {
			transition: 'all 80ms',
		},
	},
	{ dark: true },
);

// https://github.com/codemirror/theme-one-dark/blob/1e54a0f3ed90988ffb791dfc33591f4e3a431c7f/src/one-dark.ts#LL115C1-L150C3
const highlight = HighlightStyle.define([
	{ tag: t.keyword, color: violet },
	{
		tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
		color: coral,
	},
	{ tag: [t.function(t.variableName), t.labelName], color: malibu },
	{ tag: [t.color, t.constant(t.name), t.standard(t.name)], color: whiskey },
	{ tag: [t.definition(t.name), t.separator], color: ivory },
	{
		tag: [
			t.typeName,
			t.className,
			t.number,
			t.changed,
			t.annotation,
			t.modifier,
			t.self,
			t.namespace,
		],
		color: chalky,
	},
	{
		tag: [
			t.operator,
			t.operatorKeyword,
			t.url,
			t.escape,
			t.regexp,
			t.link,
			t.special(t.string),
		],
		color: cyan,
	},
	{ tag: [t.meta, t.comment], color: stone },
	{ tag: t.strong, fontWeight: 'bold' },
	{ tag: t.emphasis, fontStyle: 'italic' },
	{ tag: t.strikethrough, textDecoration: 'line-through' },
	{ tag: t.link, color: stone, textDecoration: 'underline' },
	{ tag: t.heading, fontWeight: 'bold', color: coral },
	{ tag: [t.atom, t.bool, t.special(t.variableName)], color: whiskey },
	{ tag: [t.processingInstruction, t.string, t.inserted], color: sage },
	{ tag: t.invalid, color: invalid },
]);

const disableGrammarly = EditorView.contentAttributes.of({
	'data-enable-grammarly': 'false',
});

type EditorProps = {
	value?: string;
	onChange?: (value: string) => void;
	readOnly: boolean;
};

export default function Editor(props: EditorProps) {
	return (
		<CodeMirror
			value={props.value}
			onValueChange={props.onChange}
			class="text-sm"
			wrapLine
			readOnly={props.readOnly}
			extensions={[
				basicSetup,
				StreamLanguage.define(shader),
				syntaxHighlighting(highlight),
				keymap.of([indentWithTab]), // enable indent with tab,
				indentUnit.of('    '), // indent 4 spaces
				disableGrammarly,
			]}
			theme={theme}
			showLineNumbers
		/>
	);
}
