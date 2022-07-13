import { actionBuilder } from "../actionBuilder"
import { Store } from "vuex"
import { enhancedHandlerBuilder } from "../enhancedHandlerBuilder"

jest.mock("../enhancedHandlerBuilder", () => {
    const actual = jest.requireActual("../enhancedHandlerBuilder").enhancedHandlerBuilder
    return {
        enhancedHandlerBuilder: jest.fn(actual),
    }
})

describe("actionBuilder", () => {
    it("should pipe arguments to enhancedHandlerBuilder", () => {
        // given
        const type = "foo"
        const handler = () => {}
        const options = { namespaceBuilder: () => "bar/baz" }
        const enhancedHandlerBuilderMock = enhancedHandlerBuilder as jest.Mock

        // when
        actionBuilder(type, handler, options)

        // then
        expect(enhancedHandlerBuilderMock).toBeCalledWith(type, handler, options)
        expect(enhancedHandlerBuilderMock).toBeCalledTimes(1)
    })

    describe("with mock store", () => {
        let store: Store<string>

        beforeEach(() => {
            store = {
                dispatch: jest.fn(),
            } as unknown as Store<string>
        })

        it("should dispatch directly to store", () => {
            // given
            const payload = { foo: "bar" }
            const type = "sometype"
            const action = actionBuilder(type, jest.fn())

            // when
            action.dispatch(store, payload)

            // then
            expect(store.dispatch).toBeCalledWith(action(payload))
        })
    })
})
