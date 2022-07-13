import { BuilderFactoryOptions, EnhancedHandler, EnhancedHandlerOptions, enhancedHandlerBuilder } from "./enhancedHandlerBuilder"
import { Store } from "vuex"

type MutationEvent<Payload> = {
    type: string
    payload: Payload
}

export type TypedMutationHandler<Payload, State> = (state: State, payload: { payload: Payload }) => State | void

export interface EnhancedMutation<Payload, State, NamespaceArgs>
    extends EnhancedHandler<Payload, TypedMutationHandler<Payload, State>, NamespaceArgs, MutationEvent<Payload>> {
    (payload: Payload, options?: EnhancedHandlerOptions): MutationEvent<Payload>

    commit: (store: Store<unknown>, payload: Payload, options?: EnhancedHandlerOptions) => void
}

export const mutationBuilder = <Payload, State, NamespaceArgs = void>(
    type: string,
    mutationHandler: TypedMutationHandler<Payload, State>,
    factoryOptions?: BuilderFactoryOptions<NamespaceArgs>
): EnhancedMutation<Payload, State, NamespaceArgs> => {
    const mutationDispatch = enhancedHandlerBuilder<Payload, TypedMutationHandler<Payload, State>, NamespaceArgs, MutationEvent<Payload>>(
        type,
        mutationHandler,
        factoryOptions
    ) as EnhancedMutation<Payload, State, NamespaceArgs>

    mutationDispatch.commit = (store, payload, options) => store.commit(mutationDispatch(payload, options))
    // mutationDispatch.commitNamespaced = (store, ...args) => store.commit(mutationDispatch.namespaced(...args))

    return mutationDispatch
}
