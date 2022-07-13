import { ActionContext, Getter, GetterTree } from "vuex"
import { nodesToTree } from "./nodesToTree"
import { createNamespacedFn } from "./util/createNamespacedFn"
import { BuilderFactoryOptions } from "./enhancedHandlerBuilder"

type GetterContext<State, RootState> = Pick<ActionContext<State, RootState>, "state" | "getters" | "rootState" | "rootGetters">

type TypedGetter<ReturnValue, State, RootState> = (context: GetterContext<State, RootState>) => ReturnValue

type NamespacedGetterHelper<NamespaceArgs> = NamespaceArgs extends void ? string : (nsArgs: NamespaceArgs) => string

export interface EnhancedGetter<State, RootState, NamespaceArgs> {
    type: string
    handler: Getter<State, RootState>

    namespaced: NamespacedGetterHelper<NamespaceArgs>
}

export const getterBuilderFactory = <State, RootState, NamespaceArgs = never>(options?: BuilderFactoryOptions<NamespaceArgs>) => {
    const enhancedGetters: EnhancedGetter<State, RootState, NamespaceArgs>[] = []

    const namespaceBuilder: (args: NamespaceArgs) => string = options?.namespaceBuilder || (args => `${args}`)

    return {
        generate: <ReturnValue>(
            type: string,
            handler: TypedGetter<ReturnValue, State, RootState>
        ): EnhancedGetter<State, RootState, NamespaceArgs> => {
            const enhancedGetter: EnhancedGetter<State, RootState, NamespaceArgs> = {
                type,
                handler: (state, getters, rootState, rootGetters) => handler({ state, getters, rootState, rootGetters }),
                namespaced: createNamespacedFn(
                    options,
                    `${options?.namespace}/${type}`,
                    (nsArgs: NamespaceArgs) => namespaceBuilder(nsArgs) + "/" + type
                ) as NamespacedGetterHelper<NamespaceArgs>,
            }

            enhancedGetters.push(enhancedGetter)
            return enhancedGetter
        },

        toGetterTree(): GetterTree<State, RootState> {
            return nodesToTree(enhancedGetters)
        },
    }
}
