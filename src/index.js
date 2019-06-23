export { default as device } from './plugins/device'
export { default as inview } from './plugins/inview'
export { default as mutation } from './plugins/mutation'
export { default as resize } from './plugins/resize'
export { default as scroll } from './plugins/scroll'
export { default as domEvents } from './plugins/domEvents'
import { registerPlugin } from '@spon/core'

export function withPlugins(...plugins) {
	/**
	 * @param {function} module the module to bind to
	 * @memberOf connect
	 * @return {function}
	 */
	return module => {
		return ({ name, ...props }) =>
			module({
				...props,
				name,
				plugins: {
					...plugins.reduce(
						(acc, curr) => ({
							...acc,
							...curr({
								register: registerPlugin(name),
								...props
							})
						}),
						{}
					)
				}
			})
	}
}
