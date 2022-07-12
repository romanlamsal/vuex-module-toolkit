import { mutationBuilderFactory } from "../mutationBuilderFactory"
import { mutationBuilder } from "../mutationBuilder"
import { BuilderFactoryOptions } from "../enhancedHandlerBuilder"

jest.mock("../mutationBuilder")
const mutationBuilderMock = mutationBuilder as jest.Mock

describe("mutationBuilderFactory", () => {
    beforeEach(() => {
        mutationBuilderMock.mockImplementation((type, handler) => ({ type, handler }))
    })

    afterEach(() => {
        mutationBuilderMock.mockReset()
    })

    it("should pass arguments to mutationBuilder instance when calling generate", () => {
        // given
        const type = "sometype"
        const handler = () => {}
        const factory = mutationBuilderFactory()

        // when
        factory.generate(type, handler)

        // then
        expect(mutationBuilderMock).toBeCalledWith(type, handler, undefined)
        expect(mutationBuilderMock).toBeCalledTimes(1)
    })

    it("should pass factoryOptions to mutationBuilder instance when calling generate", () => {
        // given
        const type = "sometype"
        const handler = () => {}
        const factoryOptions = { foo: "bar", bar: "baz" }
        const factory = mutationBuilderFactory(factoryOptions as BuilderFactoryOptions<unknown>)

        // when
        factory.generate(type, handler)

        // then
        expect(mutationBuilderMock).toBeCalledWith(expect.anything(), expect.anything(), factoryOptions)
        expect(mutationBuilderMock).toBeCalledTimes(1)
    })

    it("should return mutationTree with all generated mutations", () => {
        // given
        const firstType = "sometype"
        const secondType = "anothertype"
        const firstHandler = () => console.log(firstType)
        const secondHandler = () => console.log(secondType)
        const factory = mutationBuilderFactory()
        factory.generate(firstType, firstHandler)
        factory.generate(secondType, secondHandler)

        // when
        const mutationTree = factory.toMutationTree()

        // then
        expect(mutationTree).toEqual({
            [firstType]: firstHandler,
            [secondType]: secondHandler,
        })
    })
})
