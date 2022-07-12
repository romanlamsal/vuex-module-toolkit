import { actionBuilderFactory } from "../actionBuilderFactory"
import { actionBuilder } from "../actionBuilder"
import { BuilderFactoryOptions } from "../enhancedHandlerBuilder"

jest.mock("../actionBuilder")
const actionBuilderMock = actionBuilder as jest.Mock

describe("actionBuilderFactory", () => {
    beforeEach(() => {
        actionBuilderMock.mockImplementation((type, handler) => ({ type, handler }))
    })

    afterEach(() => {
        actionBuilderMock.mockReset()
    })

    it("should pass arguments to actionBuilder instance when calling generate", () => {
        // given
        const type = "sometype"
        const handler = () => {}
        const factory = actionBuilderFactory()

        // when
        factory.generate(type, handler)

        // then
        expect(actionBuilderMock).toBeCalledWith(type, handler, undefined)
        expect(actionBuilderMock).toBeCalledTimes(1)
    })

    it("should pass factoryOptions to actionBuilder instance when calling generate", () => {
        // given
        const type = "sometype"
        const handler = () => {}
        const factoryOptions = { foo: "bar", bar: "baz" }
        const factory = actionBuilderFactory(factoryOptions as BuilderFactoryOptions<unknown>)

        // when
        factory.generate(type, handler)

        // then
        expect(actionBuilderMock).toBeCalledWith(expect.anything(), expect.anything(), factoryOptions)
        expect(actionBuilderMock).toBeCalledTimes(1)
    })

    it("should return actionTree with all generated actions", () => {
        // given
        const firstType = "sometype"
        const secondType = "anothertype"
        const firstHandler = () => console.log(firstType)
        const secondHandler = () => console.log(secondType)
        const factory = actionBuilderFactory()
        factory.generate(firstType, firstHandler)
        factory.generate(secondType, secondHandler)

        // when
        const actionTree = factory.toActionTree()

        // then
        expect(actionTree).toEqual({
            [firstType]: firstHandler,
            [secondType]: secondHandler,
        })
    })
})
