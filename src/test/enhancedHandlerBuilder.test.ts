import { enhancedHandlerBuilder } from "../enhancedHandlerBuilder"

describe("enhancedHandlerBuilder without store", () => {
    it("should have the given type", () => {
        // given
        const type = "sometype"

        // when
        const action = enhancedHandlerBuilder(type, jest.fn())

        // then
        expect(action.type).toEqual(type)
    })

    it("should forward the given handler as function", () => {
        // given
        const handler = jest.fn()

        // when
        const action = enhancedHandlerBuilder("", handler)

        // then
        expect(action.handler).toEqual(handler)
    })

    it("should return an ActionEvent when called", () => {
        // given
        const type = "sometype"
        const payload = 42
        const action = enhancedHandlerBuilder<number>(type, jest.fn())

        // when
        const actionEvent = action(payload)

        // then
        expect(actionEvent).toEqual({
            type,
            payload,
        })
    })

    describe("namespaced", () => {
        it("should set the namespace via option", () => {
            // given
            const namespace = "foo/bar"
            const type = "sometype"
            const action = enhancedHandlerBuilder(type, jest.fn())

            // when
            const actionEvent = action(42, { namespace })

            // then
            expect(actionEvent.type).toEqual(namespace + "/" + type)
        })

        it("should set the namespace via action.namespaced", () => {
            // given
            const namespace = "foo/bar"
            const type = "sometype"
            const action = enhancedHandlerBuilder<number, unknown, string>(type, jest.fn())

            // when
            const actionEvent = action.namespaced(namespace, 42)

            // then
            expect(actionEvent.type).toEqual(namespace + "/" + type)
        })

        it("should set the namespace via namespacebuilder without arguments", () => {
            // given
            const namespaceBuilder = jest.fn(() => "foo/bar")
            const type = "sometype"
            const nsArgs = "baz"
            const action = enhancedHandlerBuilder<number, unknown, string>(type, jest.fn(), { namespaceBuilder })

            // when
            const actionEvent = action.namespaced(nsArgs, 42)

            // then
            expect(actionEvent.type).toEqual(namespaceBuilder() + "/" + type)
            expect(namespaceBuilder).toBeCalledWith(nsArgs)
        })

        it("should set the namespace via namespacebuilder with arguments", () => {
            // given
            const nsArgs = { name: "baz" }
            const namespaceBuilder = ({ name }: { name: string }) => `foo/bar/${name}`
            const type = "sometype"
            const action = enhancedHandlerBuilder(type, jest.fn(), { namespaceBuilder })

            // when
            const actionEvent = action.namespaced(nsArgs, 42)

            // then
            expect(actionEvent.type).toEqual(namespaceBuilder(nsArgs) + "/" + type)
        })

        it("should use provided options.namespace over factoryOptions.namespaceBuilder", () => {
            // given
            const namespace = "foo/bar"
            const type = "sometype"
            const namespaceBuilder = jest.fn(() => "this/is/wrong")
            const action = enhancedHandlerBuilder<number, unknown, string>(type, jest.fn(), { namespaceBuilder })

            // when
            const actionEvent = action.namespaced("", 42, { namespace })

            // then
            expect(actionEvent.type).toEqual(namespace + "/" + type)
            expect(namespaceBuilder).not.toBeCalled()
        })

        it("should NOT set the namespace via namespacebuilder when not calling .namespaced", () => {
            // given
            const namespaceBuilder = jest.fn(() => "foo/bar")
            const type = "sometype"
            const action = enhancedHandlerBuilder(type, jest.fn(), { namespaceBuilder })

            // when
            const actionEvent = action(42)

            // then
            expect(actionEvent.type).toEqual(type)
            expect(namespaceBuilder).not.toBeCalled()
        })

        it("should set the namespace from factoryOptions.namespace and alter .namespaced's signature", () => {
            // given
            const namespace = "foo/bar"
            const type = "sometype"
            const action = enhancedHandlerBuilder(type, jest.fn(), { namespace })

            // when
            const actionEvent = action.namespaced(42)

            // then
            expect(actionEvent.type).toEqual(namespace + "/" + type)
        })
    })
})
