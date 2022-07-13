import { mutationBuilder } from "../mutationBuilder"
import { Store } from "vuex"
import { enhancedHandlerBuilder } from "../enhancedHandlerBuilder"

jest.mock("../enhancedHandlerBuilder", () => {
    const actual = jest.requireActual("../enhancedHandlerBuilder").enhancedHandlerBuilder
    return {
        enhancedHandlerBuilder: jest.fn(actual),
    }
})

describe("mutationBuilder", () => {
    it("should pipe arguments to enhancedHandlerBuilder", () => {
        // given
        const type = "foo"
        const handler = () => {}
        const options = { namespaceBuilder: () => "bar/baz" }
        const enhancedHandlerBuilderMock = enhancedHandlerBuilder as jest.Mock

        // when
        mutationBuilder(type, handler, options)

        // then
        expect(enhancedHandlerBuilderMock).toBeCalledWith(type, handler, options)
        expect(enhancedHandlerBuilderMock).toBeCalledTimes(1)
    })

    describe("with store", () => {
        let store: Store<string>

        beforeEach(() => {
            store = {
                commit: jest.fn(),
            } as unknown as Store<string>
        })

        it("should dispatch directly to store", () => {
            // given
            const payload = { foo: "bar" }
            const type = "sometype"
            const mutation = mutationBuilder(type, jest.fn())

            // when
            mutation.commit(store, payload)

            // then
            expect(store.commit).toBeCalledWith(mutation(payload))
        })
    })
})
