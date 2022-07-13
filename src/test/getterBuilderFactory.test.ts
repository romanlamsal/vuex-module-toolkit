import { getterBuilderFactory } from "../getterBuilderFactory"

describe("getterBuilderFactory", () => {
    describe("generate", () => {
        it("should gather default getter arguments to getterContext", () => {
            // given
            const state = "moduleState"
            const getters = { foo: () => "foo" }
            const rootState = "rootState"
            const rootGetters = { bar: () => "bar" }
            const type = "sometype"
            const handler = jest.fn()
            const getter = getterBuilderFactory().generate(type, handler)

            // when
            getter.handler(state, getters, rootState, rootGetters)

            // then
            expect(handler).toBeCalledWith({ state, getters, rootState, rootGetters })
        })

        it("should return getterTree with all generated getters (by types)", () => {
            // given
            const firstType = "sometype"
            const secondType = "anothertype"
            const firstHandler = jest.fn(() => {})
            const secondHandler = jest.fn(() => {})
            const factory = getterBuilderFactory()
            factory.generate(firstType, firstHandler)
            factory.generate(secondType, secondHandler)

            // when
            const getterTree = factory.toGetterTree()

            // then
            expect(getterTree).toEqual({
                [firstType]: expect.any(Function),
                [secondType]: expect.any(Function),
            })
        })

        it("should return getterTree with all generated getters (by handlers)", () => {
            // given
            const type = "sometype"
            const handler = jest.fn(() => {})
            const factory = getterBuilderFactory()
            factory.generate(type, handler)
            const args = ["foo", "bar", "baz", "foobarbaz"] as const

            // when
            factory.toGetterTree()[type](...args)

            // then
            expect(handler).toBeCalledWith({
                state: args[0],
                getters: args[1],
                rootState: args[2],
                rootGetters: args[3],
            })
        })
    })
})
