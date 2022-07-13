import { ActionContext, Getter, GetterTree } from "vuex"
import { nodesToTree } from "./nodesToTree"

type GetterContext<State, RootState> = Pick<ActionContext<State, RootState>, "state" | "getters" | "rootState" | "rootGetters">

type TypedGetter<ReturnValue, State, RootState> = (context: GetterContext<State, RootState>) => ReturnValue

export interface EnhancedGetter<State, RootState> {
    type: string
    handler: Getter<State, RootState>
}

export const getterBuilderFactory = <State, RootState>() => {
    const enhancedGetters: EnhancedGetter<State, RootState>[] = []

    return {
        generate: <ReturnValue>(type: string, handler: TypedGetter<ReturnValue, State, RootState>): EnhancedGetter<State, RootState> => {
            const enhancedGetter: EnhancedGetter<State, RootState> = {
                type,
                handler: (state, getters, rootState, rootGetters) => handler({ state, getters, rootState, rootGetters }),
            }
            enhancedGetters.push(enhancedGetter)
            return enhancedGetter
        },

        toGetterTree(): GetterTree<State, RootState> {
            return nodesToTree(enhancedGetters)
        },
    }
}
