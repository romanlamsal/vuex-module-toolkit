import { BuilderFactoryOptions, EnhancedHandler, EnhancedHandlerOptions } from './types'
import { Store } from 'vuex'

type MutationEvent<Payload> = {
  type: string
  payload: Payload
}

export type TypedMutationHandler<Payload, State> = (state: State, payload: { payload: Payload }) => State | void

export interface EnhancedMutation<Payload, State, NamespaceArgs>
  extends EnhancedHandler<TypedMutationHandler<Payload, State>> {
  (payload: Payload, options?: EnhancedHandlerOptions): MutationEvent<Payload>

  namespaced: (nsArgs: NamespaceArgs, payload: Payload, options?: EnhancedHandlerOptions) => MutationEvent<Payload>
  commit: (store: Store<State>, payload: Payload, options?: EnhancedHandlerOptions) => void
  commitNamespaced: (
    store: Store<State>,
    nsArgs: NamespaceArgs,
    payload: Payload,
    options?: EnhancedHandlerOptions
  ) => void
}

export const mutationBuilder = <Payload, State, NamespaceArgs = unknown>(
  type: string,
  mutationHandler: TypedMutationHandler<Payload, State>,
  factoryOptions?: BuilderFactoryOptions<NamespaceArgs>
): EnhancedMutation<Payload, State, NamespaceArgs> => {
  const namespaceBuilder: (args: NamespaceArgs) => string = factoryOptions?.namespaceBuilder || (args => `${args}`)

  const mutationDispatch: EnhancedMutation<Payload, State, NamespaceArgs> = (payload, options) => {
    let namespacedType = type

    if (options?.namespace) {
      namespacedType = [options.namespace, type].join('/')
    }

    return {
      type: namespacedType,
      payload
    } as MutationEvent<Payload>
  }

  mutationDispatch.type = type
  mutationDispatch.handler = mutationHandler
  mutationDispatch.namespaced = (nsArgs, payload, options) =>
    mutationDispatch(payload, { namespace: options?.namespace || namespaceBuilder(nsArgs) })
  mutationDispatch.commit = (store, payload, options) => store.commit(mutationDispatch(payload, options))
  mutationDispatch.commitNamespaced = (store, nsArgs, payload, options) =>
    store.dispatch(mutationDispatch.namespaced(nsArgs, payload, options))

  return mutationDispatch
}
