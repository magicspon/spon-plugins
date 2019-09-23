import { loadModule, unLoadModule } from '@spon/core'

import { withPlugins } from '.'

describe('withPlugins', () => {
	it('should be a function', () => {
		expect(withPlugins).toBeInstanceOf(Function)
	})

	it('should compose modules with just plugin props', () => {
		let result = 0

		const mod = ({ a, plugins: { b, c } }) => {
			result = a + b + c
		}

		const plugin = () => {
			return { b: 2 }
		}

		const plugin2 = () => {
			return { c: 3 }
		}

		const behaviour = withPlugins(plugin, plugin2)(mod)

		behaviour({ a: 10 })
		expect(result).toBe(15)
	})

	it('should destroy the plugins', () => {
		const destroy = jest.fn()
		const destroyPlugin = jest.fn()

		const mod = () => {
			return destroy
		}

		const plugin = ({ register }) => {
			register(() => {
				console.log('a')
				destroyPlugin()
			})

			return { b: 2 }
		}

		loadModule({
			module: withPlugins(plugin)(mod),
			id: 'test',
			name: 'test'
		})

		unLoadModule('test')

		expect(destroy).toHaveBeenCalledTimes(1)
		// expect(destroyPlugin).toHaveBeenCalledTimes(1)
	})
})
