import { ActionTree } from "vuex"
import { actionBuilder, EnhancedAction, TypedActionHandler } from "./actionBuilder"
import { BuilderFactoryOptions, EnhancedHandler } from "./types"

export const actionBuilderFactory = <State, RootState, NamespaceArgs = unknown>(options?: BuilderFactoryOptions<NamespaceArgs>) => {
    const enhancedActions: EnhancedHandler[] = []

    return {
        generate: <Payload, ReturnValue = unknown>(
            type: string,
            actionHandler: TypedActionHandler<Payload, State, RootState, ReturnValue>
        ): EnhancedAction<Payload, State, RootState, ReturnValue, NamespaceArgs> => {
            const enhancedAction = actionBuilder<Payload, State, RootState, ReturnValue, NamespaceArgs>(type, actionHandler, options)
            enhancedActions.push(enhancedAction as EnhancedHandler)
            return enhancedAction
        },

        toActionTree(): ActionTree<State, RootState> {
            return enhancedActions.reduce(
                (actionTree, enhancedAction) => ({
                    ...actionTree,
                    [enhancedAction.type]: enhancedAction.handler,
                }),
                {}
            )
        },
    }
}
