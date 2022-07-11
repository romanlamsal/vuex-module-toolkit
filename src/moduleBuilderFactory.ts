import { BuilderFactoryOptions } from "./types"
import { actionBuilderFactory } from "./actionBuilderFactory"
import { Module, Store } from "vuex"
import { mutationBuilderFactory } from "./mutationBuilderFactory"

type ModuleBuilderFactoryOptions<State, ConstructorArgs, NamespaceArgs> = BuilderFactoryOptions<NamespaceArgs> & {
    state: (args: ConstructorArgs) => State
}

export const moduleBuilderFactory = <State, RootState, ConstructorArgs = unknown, NamespaceArgs = unknown>(
    options: ModuleBuilderFactoryOptions<State, ConstructorArgs, NamespaceArgs>
) => {
    const actionFactory = actionBuilderFactory<State, RootState, NamespaceArgs>(options)
    const mutationFactory = mutationBuilderFactory<State, NamespaceArgs>(options)

    const namespaceBuilder: (args: NamespaceArgs & Partial<ConstructorArgs>) => string = options?.namespaceBuilder || (args => `${args}`)

    const getModule = (constructorArgs: ConstructorArgs & NamespaceArgs): Module<State, RootState> => ({
        namespaced: true,
        mutations: mutationFactory.toMutationTree(),
        actions: actionFactory.toActionTree(),
        state: options.state(constructorArgs),
    })

    return {
        getModule,
        getNamespace: (nsArgs: NamespaceArgs) => namespaceBuilder(nsArgs),
        addAction: actionFactory.generate,
        addMutation: mutationFactory.generate,
        hasModule: (store: Store<RootState>, nsArgs: NamespaceArgs) => store.hasModule(namespaceBuilder(nsArgs)),
        register: async (
            store: Store<RootState>,
            constructorArgs: ConstructorArgs,
            nsArgs: NamespaceArgs,
            continueOnDuplicate?: boolean
        ) => {
            const namespace = namespaceBuilder(nsArgs)

            if (continueOnDuplicate && store.hasModule(namespace)) {
                return false
            }

            await store.registerModule(namespace, getModule({ ...constructorArgs, ...nsArgs }))
            return true
        },
        unregister: async (store: Store<RootState>, nsArgs: NamespaceArgs) => store.unregisterModule(namespaceBuilder(nsArgs)),
    }
}
