export type EnhancedHandlerOptions = { namespace?: string }

export interface EnhancedHandler<Payload = unknown, HandlerType = Function, NamespaceArgs = unknown, EventType = unknown> {
    (payload: Payload, options?: BuilderFactoryOptions<NamespaceArgs>): EventType

    type: string
    handler: HandlerType
    namespaced: (nsArgs: NamespaceArgs, payload: Payload, options?: EnhancedHandlerOptions) => EventType
}

export type BuilderFactoryOptions<NamespaceArgs> = {
    namespace?: string
    namespaceBuilder?: (args: NamespaceArgs) => string
}

export const enhancedHandlerBuilder = <
    Payload = unknown,
    HandlerType = unknown,
    NamespaceArgs = unknown,
    EventType extends { type: string; payload: Payload } = { type: string; payload: Payload },
    EnhancedHandlerType extends EnhancedHandler<Payload, HandlerType, NamespaceArgs, EventType> = EnhancedHandler<
        Payload,
        HandlerType,
        NamespaceArgs,
        EventType
    >
>(
    type: string,
    handler: HandlerType,
    factoryOptions?: BuilderFactoryOptions<NamespaceArgs>
): EnhancedHandlerType => {
    const namespaceBuilder: (args: NamespaceArgs) => string = factoryOptions?.namespaceBuilder || (args => `${args}`)

    const enhancedHandler: EnhancedHandler<Payload, HandlerType, NamespaceArgs, EventType> = (payload, options) => {
        let namespacedType = type

        if (options?.namespace) {
            namespacedType = [options.namespace, type].join("/")
        }

        return {
            type: namespacedType,
            payload,
        } as EventType
    }

    enhancedHandler.type = type
    enhancedHandler.handler = handler
    enhancedHandler.namespaced = (nsArgs, payload, options) =>
        enhancedHandler(payload, { namespace: options?.namespace || namespaceBuilder(nsArgs) }) as EventType

    return enhancedHandler as EnhancedHandlerType
}
