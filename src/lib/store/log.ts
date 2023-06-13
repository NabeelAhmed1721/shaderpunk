import { createEffect, createRoot, createSignal } from 'solid-js';

type Log = {
	message: string;
	type: 'info' | 'warn' | 'error';
};

function createLogSignal() {
	const [logs, setLogs] = createSignal<Log[]>([]);

	createEffect(() => {
		// prevent the log from getting too long
		if (logs().length > 100) {
			setLogs((log) => log.slice(0, -1));
		}
	});

	const addLog = (message: string | any, type: Log['type'] = 'info') => {
		// backup just in case object can't be convert to a string
		switch (type) {
			case 'info':
				console.log(message);
				break;
			case 'warn':
				console.warn(message);
				break;
			case 'error':
				console.error(message);
				break;
		}

		if (typeof message !== 'string') {
			message = message.toString();
		}

		message = message?.trim();

		// remove weird character at the end of some webgl error messages
		if (message.charCodeAt(message.length - 1) == 0) {
			// remove last character of string
			message = message.slice(0, -1);
		}

		setLogs((log) => [{ message, type }, ...log]);
	};

	const info = (message: string) => {
		addLog(message, 'info');
	};

	const warn = (message: string) => {
		addLog(message, 'warn');
	};

	const error = (message: string) => {
		addLog(message, 'error');
	};

	const clearLog = () => {
		setLogs([]);
	};

	return { logs, addLog, clearLog, info, warn, error };
}

export default createRoot(createLogSignal);
