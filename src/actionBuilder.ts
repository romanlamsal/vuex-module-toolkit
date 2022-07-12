import { ActionContext, Store } from "vuex"
import { BuilderFactoryOptions, EnhancedHandler, EnhancedHandlerOptions, enhancedHandlerBuilder } from "./enhancedHandlerBuilder"

export type ActionEvent<Payload> = {
    type: string
    payload: Payload
}

export type TypedActionHandler<Payload, State, RootState, ReturnType> = (
    this: Store<RootState>,
    injectee: ActionContext<State, RootState>,
    event: ActionEvent<Payload>
) => ReturnType

export interface EnhancedAction<Payload = any, State = unknown, RootState = unknown, ReturnValue = unknown, NamespaceArgs = unknown>
    extends EnhancedHandler<Payload, TypedActionHandler<Payload, State, RootState, ReturnValue>, NamespaceArgs, ActionEvent<Payload>> {
    (payload: Payload, options?: EnhancedHandlerOptions): ActionEvent<Payload>

    dispatch: (store: Store<RootState>, payload: Payload, options?: EnhancedHandlerOptions) => Promise<ReturnValue>
    dispatchNamespaced: (
        store: Store<RootState>,
        nsArgs: NamespaceArgs,
        payload: Payload,
        options?: EnhancedHandlerOptions
    ) => Promise<ReturnValue>
}

export const actionBuilder = <Payload, State = unknown, RootState = unknown, ReturnValue = unknown, NamespaceArgs = unknown>(
    type: string,
    actionHandler: TypedActionHandler<Payload, State, RootState, ReturnValue>,
    factoryOptions?: BuilderFactoryOptions<NamespaceArgs>
): EnhancedAction<Payload, State, RootState, ReturnValue, NamespaceArgs> => {
    const actionDispatch = enhancedHandlerBuilder<
        Payload,
        TypedActionHandler<Payload, State, RootState, ReturnValue>,
        NamespaceArgs,
        ActionEvent<Payload>,
        EnhancedAction<Payload, State, RootState, ReturnValue, NamespaceArgs>
    >(type, actionHandler, factoryOptions)

    actionDispatch.dispatch = (store, payload, options) => store.dispatch(actionDispatch(payload, options))
    actionDispatch.dispatchNamespaced = (store, nsArgs, payload, options) =>
        store.dispatch(actionDispatch.namespaced(nsArgs, payload, options))

    return actionDispatch
}
