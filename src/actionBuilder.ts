import { ActionContext, Store } from "vuex"
import { BuilderFactoryOptions, EnhancedHandler, EnhancedHandlerOptions } from "./types"

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
    extends EnhancedHandler<
        | TypedActionHandler<Payload, State, RootState, ReturnValue>
        | { root?: boolean; handler: TypedActionHandler<Payload, State, RootState, ReturnValue> }
    > {
    (payload: Payload, options?: EnhancedHandlerOptions): ActionEvent<Payload>

    namespaced: (nsArgs: NamespaceArgs, payload: Payload, options?: EnhancedHandlerOptions) => ActionEvent<Payload>
    dispatch: (store: Store<State>, payload: Payload, options?: EnhancedHandlerOptions) => Promise<ReturnValue>
    dispatchNamespaced: (
        store: Store<State>,
        nsArgs: NamespaceArgs,
        payload: Payload,
        options?: EnhancedHandlerOptions
    ) => Promise<ReturnValue>
}

export const actionBuilder = <Payload, State, RootState, ReturnValue, NamespaceArgs = unknown>(
    type: string,
    actionHandler: TypedActionHandler<Payload, State, RootState, ReturnValue>,
    factoryOptions?: BuilderFactoryOptions<NamespaceArgs>
): EnhancedAction<Payload, State, RootState, ReturnValue, NamespaceArgs> => {
    const namespaceBuilder: (args: NamespaceArgs) => string = factoryOptions?.namespaceBuilder || (args => `${args}`)

    const actionDispatch: EnhancedAction<Payload, State, RootState, ReturnValue, NamespaceArgs> = (payload, options) => {
        let namespacedType = type

        if (options?.namespace) {
            namespacedType = [options.namespace, type].join("/")
        }

        return {
            type: namespacedType,
            payload,
        } as ActionEvent<Payload>
    }

    actionDispatch.type = type
    actionDispatch.handler = actionHandler
    actionDispatch.namespaced = (nsArgs, payload, options) =>
        actionDispatch(payload, { namespace: options?.namespace || namespaceBuilder(nsArgs) })
    actionDispatch.dispatch = (store, payload, options) => store.dispatch(actionDispatch(payload, options))
    actionDispatch.dispatchNamespaced = (store, nsArgs, payload, options) =>
        store.dispatch(actionDispatch.namespaced(nsArgs, payload, options))

    return actionDispatch
}
