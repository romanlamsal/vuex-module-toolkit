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
    commitNamespaced: (store: Store<unknown>, nsArgs: NamespaceArgs, payload: Payload, options?: EnhancedHandlerOptions) => void
}

export const mutationBuilder = <Payload, State, NamespaceArgs = unknown>(
    type: string,
    mutationHandler: TypedMutationHandler<Payload, State>,
    factoryOptions?: BuilderFactoryOptions<NamespaceArgs>
): EnhancedMutation<Payload, State, NamespaceArgs> => {
    const mutationDispatch = enhancedHandlerBuilder<
        Payload,
        TypedMutationHandler<Payload, State>,
        NamespaceArgs,
        MutationEvent<Payload>,
        EnhancedMutation<Payload, State, NamespaceArgs>
    >(type, mutationHandler, factoryOptions)

    mutationDispatch.commit = (store, payload, options) => store.commit(mutationDispatch(payload, options))
    mutationDispatch.commitNamespaced = (store, nsArgs, payload, options) =>
        store.commit(mutationDispatch.namespaced(nsArgs, payload, options))

    return mutationDispatch
}
