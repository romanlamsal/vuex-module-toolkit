import { ActionTree } from "vuex"
import { actionBuilder, EnhancedAction, TypedActionHandler } from "./actionBuilder"
import { BuilderFactoryOptions, EnhancedHandler } from "./enhancedHandlerBuilder"
import { nodesToTree } from "./nodesToTree"

export const actionBuilderFactory = <State, RootState, NamespaceArgs = void>(factoryOptions?: BuilderFactoryOptions<NamespaceArgs>) => {
    const enhancedActions: EnhancedHandler[] = []

    return {
        generate: <Payload, ReturnValue = unknown>(
            type: string,
            actionHandler: TypedActionHandler<Payload, State, RootState, ReturnValue>
        ): EnhancedAction<Payload, State, RootState, ReturnValue, NamespaceArgs> => {
            const enhancedAction = actionBuilder<Payload, State, RootState, ReturnValue, NamespaceArgs>(type, actionHandler, factoryOptions)
            enhancedActions.push(enhancedAction as EnhancedHandler)
            return enhancedAction
        },

        toActionTree(): ActionTree<State, RootState> {
            return nodesToTree(enhancedActions)
        },
    }
}
