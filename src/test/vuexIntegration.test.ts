import { Store } from "vuex"
import { actionBuilder } from "../actionBuilder"
import { mutationBuilder } from "../mutationBuilder"
import { moduleBuilderFactory } from "../moduleBuilderFactory"

type StoreState = {
    value: string
}

type ModuleState = {
    value: number
}

describe("with vuex store", () => {
    describe("without module", () => {
        let store: Store<StoreState>

        const setMutation = mutationBuilder<string, StoreState, StoreState>("SET", (state, { payload }) => {
            state.value = payload
        })

        const setAction = actionBuilder<string, StoreState, StoreState>("set", ({ commit }, { payload }) => {
            commit(setMutation(payload))
        })

        beforeEach(() => {
            store = new Store<StoreState>({
                state: () => ({ value: "" }),
                mutations: {
                    [setMutation.type]: setMutation.handler,
                },
                actions: {
                    [setAction.type]: setAction.handler,
                },
            })
        })

        it("should properly mutate value via store.commit", () => {
            // given
            const newValue = "foobarbaz"

            // when
            store.commit(setMutation(newValue))

            // then
            expect(store.state.value).toEqual(newValue)
        })

        it("should properly mutate value via mutation.commit", () => {
            // given
            const newValue = "foobarbaz"

            // when
            setMutation.commit(store, newValue)

            // then
            expect(store.state.value).toEqual(newValue)
        })

        it("should dispatch a proper action via store.dispatch", () => {
            // given
            const newValue = "foobarbaz"

            // when
            store.dispatch(setAction(newValue))

            // then
            expect(store.state.value).toEqual(newValue)
        })

        it("should dispatch a proper action via action.dispatch", () => {
            // given
            const newValue = "foobarbaz"

            // when
            setAction.dispatch(store, newValue)

            // then
            expect(store.state.value).toEqual(newValue)
        })
    })

    describe("with module and namespacebuilder", () => {
        const id = "bar"
        let store: Store<StoreState>

        const moduleFactory = moduleBuilderFactory<ModuleState, StoreState, string>({
            namespaceBuilder: (id: string) => `foo/${id}/baz`,
        })

        const setMutation = moduleFactory.addMutation<number>("SET", (state, { payload }) => {
            state.value = payload
        })

        const setAction = moduleFactory.addAction<number>("set", ({ commit }, { payload }) => {
            commit(setMutation(payload))
        })

        beforeEach(() => {
            store = new Store<StoreState>({
                state: () => ({ value: "" }),
            })
            moduleFactory.register(store, {
                continueOnDuplicate: false,
                initialState: { value: -1 },
                namespaceArgs: id,
            })
        })

        afterEach(() => {
            moduleFactory.unregister(store, id)
        })

        it("should properly mutate value via store.commit", () => {
            // given
            const newValue = 42

            // when
            store.commit(setMutation.namespaced(id, newValue))

            // then
            expect(moduleFactory.storeState(store, id).value).toEqual(newValue)
        })

        it("should properly mutate value via mutation.commit", () => {
            // given
            const newValue = 42

            // when
            setMutation.commitNamespaced(store, id, newValue)

            // then
            expect(moduleFactory.storeState(store, id).value).toEqual(newValue)
        })

        it("should dispatch a proper action via store.dispatch", () => {
            // given
            const newValue = 42

            // when
            store.dispatch(setAction.namespaced(id, newValue))

            // then
            expect(moduleFactory.storeState(store, id).value).toEqual(newValue)
        })

        it("should dispatch a proper action via action.dispatch", () => {
            // given
            const newValue = 42

            // when
            setAction.dispatchNamespaced(store, id, newValue)

            // then
            expect(moduleFactory.storeState(store, id).value).toEqual(newValue)
        })
    })
})
