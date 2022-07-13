import { BuilderFactoryOptions } from "./enhancedHandlerBuilder"
import { actionBuilderFactory } from "./actionBuilderFactory"
import { mapGetters, mapState, Module, Store } from "vuex"
import { mutationBuilderFactory } from "./mutationBuilderFactory"
import { EnhancedGetter, getterBuilderFactory } from "./getterBuilderFactory"
import { createNamespacedFn } from "./util/createNamespacedFn"

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

type MapGettersFn<State, RootState, NamespaceArgs> = NamespaceArgs extends void
    ? (...getters: EnhancedGetter<State, RootState, NamespaceArgs>[]) => ReturnType<typeof mapGetters>
    : (nsArgs: NamespaceArgs, ...getters: EnhancedGetter<State, RootState, NamespaceArgs>[]) => ReturnType<typeof mapGetters>

export const moduleBuilderFactory = <State, RootState = unknown, NamespaceArgs = void>(
    options?: ModuleBuilderFactoryOptions<NamespaceArgs>
) => {
    const actionFactory = actionBuilderFactory<State, RootState, NamespaceArgs>(options)
    const mutationFactory = mutationBuilderFactory<State, NamespaceArgs>(options)
    const getterFactory = getterBuilderFactory<State, RootState, NamespaceArgs>(options)

    const namespaceBuilder: (args: NamespaceArgs) => string =
        options?.namespaceBuilder || (options?.namespace && (() => options.namespace!)) || (args => `${args}`)

    const getModule = (initialState: State): Module<State, RootState> => ({
        namespaced: true,
        mutations: mutationFactory.toMutationTree(),
        actions: actionFactory.toActionTree(),
        getters: getterFactory.toGetterTree(),
        state: initialState,
    })

    const namespaceFn = createNamespacedFn(options, options?.namespace as string, namespaceBuilder) as NamespaceFn<NamespaceArgs>

    const mapStateFn = createNamespacedFn<MapStateFn<State, void>, MapStateFn<State, any>>(
        options,
        (expr: MapStateExpr<State>) => mapState(options?.namespace as string, expr),
        (nsArgs: NamespaceArgs, expr: MapStateExpr<State>) => mapState(namespaceBuilder(nsArgs), expr)
    ) as MapStateFn<State, NamespaceArgs>

    const mapGettersFn = createNamespacedFn<MapGettersFn<State, RootState, void>, MapGettersFn<State, RootState, any>>(
        options,
        (...getters) =>
            mapGetters(
                options!.namespace as string,
                getters.map(getter => getter.type)
            ),
        (nsArgs: NamespaceArgs, ...getters: EnhancedGetter<State, RootState, NamespaceArgs>[]) =>
            mapGetters(
                namespaceBuilder(nsArgs) as string,
                getters.map(getter => getter.type)
            )
    ) as MapGettersFn<State, RootState, NamespaceArgs>

    return {
        getModule,
        namespace: namespaceFn,
        addAction: actionFactory.generate,
        addMutation: mutationFactory.generate,
        addGetter: getterFactory.generate,
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
        mapGetters: mapGettersFn,
    }
}
