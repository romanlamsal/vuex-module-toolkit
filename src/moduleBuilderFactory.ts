import { BuilderFactoryOptions } from "./enhancedHandlerBuilder"
import { actionBuilderFactory } from "./actionBuilderFactory"
import { Module, Store } from "vuex"
import { mutationBuilderFactory } from "./mutationBuilderFactory"

type ModuleBuilderFactoryOptions<NamespaceArgs> = BuilderFactoryOptions<NamespaceArgs>

type RegisterOptions<State, NamespaceArgs> = {
    namespaceArgs: NamespaceArgs
    initialState: State
    continueOnDuplicate?: boolean
}

export const moduleBuilderFactory = <State, RootState = unknown, NamespaceArgs = void>(
    options?: ModuleBuilderFactoryOptions<NamespaceArgs>
) => {
    const actionFactory = actionBuilderFactory<State, RootState, NamespaceArgs>(options)
    const mutationFactory = mutationBuilderFactory<State, NamespaceArgs>(options)

    const namespaceBuilder: (args: NamespaceArgs) => string = options?.namespaceBuilder || (args => `${args}`)

    const getModule = (initialState: State): Module<State, RootState> => ({
        namespaced: true,
        mutations: mutationFactory.toMutationTree(),
        actions: actionFactory.toActionTree(),
        state: initialState,
    })

    return {
        getModule,
        getNamespace: (nsArgs: NamespaceArgs) => namespaceBuilder(nsArgs),
        addAction: actionFactory.generate,
        addMutation: mutationFactory.generate,
        hasModule: (store: Store<RootState>, nsArgs: NamespaceArgs) => store.hasModule(namespaceBuilder(nsArgs)),
        register: async (
            store: Store<RootState>,
            { namespaceArgs, initialState, continueOnDuplicate }: RegisterOptions<State, NamespaceArgs>
        ) => {
            const namespace = namespaceBuilder(namespaceArgs)

            if (continueOnDuplicate && store.hasModule(namespace)) {
                return false
            }

            await store.registerModule(namespace, getModule(initialState))
            return true
        },
        unregister: async (store: Store<RootState>, nsArgs: NamespaceArgs) => store.unregisterModule(namespaceBuilder(nsArgs)),
        storeState: (store: Store<RootState>, nsArgs: NamespaceArgs) => {
            // @ts-ignore
            return store.state[namespaceBuilder(nsArgs)]
        },
    }
}
