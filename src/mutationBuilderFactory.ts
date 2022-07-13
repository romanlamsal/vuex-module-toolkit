import { MutationTree } from "vuex"
import { BuilderFactoryOptions, EnhancedHandler } from "./enhancedHandlerBuilder"
import { EnhancedMutation, mutationBuilder, TypedMutationHandler } from "./mutationBuilder"
import { nodesToTree } from "./nodesToTree"

export const mutationBuilderFactory = <State, NamespaceArgs = void>(options?: BuilderFactoryOptions<NamespaceArgs>) => {
    const enhancedMutations: EnhancedHandler[] = []

    return {
        generate: <Payload>(
            type: string,
            mutationHandler: TypedMutationHandler<Payload, State>
        ): EnhancedMutation<Payload, State, NamespaceArgs> => {
            const enhancedMutation = mutationBuilder<Payload, State, NamespaceArgs>(type, mutationHandler, options)
            enhancedMutation.type = type
            enhancedMutations.push(enhancedMutation as EnhancedHandler)
            return enhancedMutation
        },

        toMutationTree(): MutationTree<State> {
            return nodesToTree(enhancedMutations)
        },
    }
}
