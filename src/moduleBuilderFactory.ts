import { BuilderFactoryOptions } from "./enhancedHandlerBuilder"
import { actionBuilderFactory } from "./actionBuilderFactory"
import { mapState, Module, Store } from "vuex"
import { mutationBuilderFactory } from "./mutationBuilderFactory"

type ModuleBuilderFactoryOptions<NamespaceArgs> = BuilderFactoryOptions<NamespaceArgs>

type RegisterOptions<State, NamespaceArgs> = {
    initialState: State
    continueOnDuplicate?: boolean
} & (NamespaceArgs extends void ? { namespaceArgs?: void } : { namespaceArgs: NamespaceArgs })

type NamespaceFn<NamespaceArgs> = NamespaceArgs extends void ? string : (args: NamespaceArgs) => string

type MapStateExpr<State> = Extract<keyof State, string>[]

type MapStateFn<State, NamespaceArgs> = NamespaceArgs extends void
    ? (expr: MapStateExpr<State>) => ReturnType<typeof mapState>
    : (nsArgs: NamespaceArgs, expr: MapStateExpr<State>) => ReturnType<typeof mapState>

export const moduleBuilderFactory = <State, RootState = unknown, NamespaceArgs = void>(
    options?: ModuleBuilderFactoryOptions<NamespaceArgs>
) => {
    const actionFactory = actionBuilderFactory<State, RootState, NamespaceArgs>(options)
    const mutationFactory = mutationBuilderFactory<State, NamespaceArgs>(options)

    const namespaceBuilder: (args: NamespaceArgs) => string =
        options?.namespaceBuilder || (options?.namespace && (() => options.namespace!)) || (args => `${args}`)

    const getModule = (initialState: State): Module<State, RootState> => ({
        namespaced: true,
        mutations: mutationFactory.toMutationTree(),
        actions: actionFactory.toActionTree(),
        state: initialState,
    })

    const namespaceFn: NamespaceFn<NamespaceArgs> = (
        options?.namespace ? options.namespace! : namespaceBuilder
    ) as NamespaceFn<NamespaceArgs>

    const mapStateFn = (
        options?.namespace
            ? (((expr: MapStateExpr<State>) => mapState(options.namespace!, expr)) as MapStateFn<State, void>)
            : (nsArgs: NamespaceArgs, expr: MapStateExpr<State>) => mapState(namespaceBuilder(nsArgs), expr)
    ) as MapStateFn<State, NamespaceArgs>

    return {
        getModule,
        namespace: namespaceFn,
        addAction: actionFactory.generate,
        addMutation: mutationFactory.generate,
        hasModule: (store: Store<RootState>, nsArgs: NamespaceArgs) => store.hasModule(namespaceBuilder(nsArgs)),
        register: async (
            store: Store<RootState>,
            { namespaceArgs, initialState, continueOnDuplicate }: RegisterOptions<State, NamespaceArgs>
        ) => {
            const namespace = namespaceBuilder(namespaceArgs as NamespaceArgs)

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
        mapState: mapStateFn,
    }
}
