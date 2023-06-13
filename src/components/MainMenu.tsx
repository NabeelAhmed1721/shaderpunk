import MenuWrapper, { MenuProps } from './MenuWrapper';

type MainMenuProps = MenuProps;

export default function MainMenu(props: MainMenuProps) {
	return (
		<div class="absolute left-0 flex w-full justify-center">
			<MenuWrapper isOpen={props.isOpen} onBlur={props.onBlur}>
				<div class="flex h-60 w-[512px] max-w-full flex-col p-3">
					<div class="flex-1">
						<p>
							Shaderpunk was created as a niche solution to an
							annoying problem: having to use bulky video editing
							software to add visual effects to short videos.
						</p>
						<br />
						<p>
							Shaderpunk is a powerful browser-based program that
							allows you to add shaders to short clips and videos
							in real-time. This means you can quickly create
							stunning video effects without the need for large,
							overkill video editing software.
						</p>
						<br />
						<p>
							Video effects are represented through GLSL fragment
							shader code, which allows you to tinker with effects
							and dial in the perfect values.
						</p>
						<br />
						<p>Thank you, and have fun! - Nabeel Ahmed</p>
					</div>

					<div class="border-t border-neutral-700 pt-3 text-center">
						<a
							href="https://github.com/nabeelahmed1721/"
							target="_blank"
							rel="noopener noreferrer"
							class="mx-2 text-neutral-300 underline"
						>
							Shaderpunk v0.0.1
						</a>

						<a
							href="https://github.com/nabeelahmed1721/"
							target="_blank"
							rel="noopener noreferrer"
							class="mx-2 text-neutral-300 underline"
						>
							Changelog
						</a>
					</div>
				</div>
			</MenuWrapper>
		</div>
	);
}
