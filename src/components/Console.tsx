import { For, Match, Switch } from 'solid-js';
import logger from '../lib/store/log';
import { IoAlertCircleOutline, IoChevronForward } from 'solid-icons/io';

// TODO: instead of looping over each log every time, just append it to the list
// look into https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus

// TODO: add time stamp

// TODO: flip array backwards so it's easier to read and slice

export default function Console() {
	const { logs } = logger;

	return (
		<div>
			<For each={logs()}>
				{({ message, type }) => (
					<Switch>
						<Match when={type === 'info'}>
							<div class="flex items-center py-2">
								<div>
									<IoChevronForward
										size={16}
										class="mr-2 inline"
									/>
									{message}
								</div>
							</div>
						</Match>
						<Match when={type === 'warn'}>
							<div class="flex items-center bg-yellow-950 py-2 text-yellow-300">
								<IoAlertCircleOutline
									size={16}
									class="mr-2 inline"
								/>
								{message}
							</div>
						</Match>
						<Match when={type === 'error'}>
							<div class="flex items-center bg-red-950 py-2 text-red-300">
								<IoAlertCircleOutline
									size={16}
									class="mr-2 inline"
								/>
								{message}
							</div>
						</Match>
					</Switch>
				)}
			</For>
		</div>
	);
}
