export type EnhancedHandlerOptions = { namespace?: string }

export interface EnhancedHandler<Payload = unknown, HandlerType = Function, NamespaceArgs = void, EventType = unknown> {
    (payload: Payload, options?: BuilderFactoryOptions<NamespaceArgs>): EventType

    type: string
    handler: HandlerType
    namespaced: NamespaceArgs extends void ? FixedNamespaceFn<Payload, EventType> : DynamicNamespaceFn<Payload, NamespaceArgs, EventType>
}

type FixedNamespaceFn<Payload, EventType> = (payload: Payload, options?: EnhancedHandlerOptions) => EventType
type DynamicNamespaceFn<Payload, NamespaceArgs, EventType> = (
    nsArgs: NamespaceArgs,
    payload: Payload,
    options?: EnhancedHandlerOptions
) => EventType

export type BuilderFactoryOptions<NamespaceArgs> = {
    namespace?: string
    namespaceBuilder?: (args: NamespaceArgs) => string
}

export const enhancedHandlerBuilder = <
    Payload = unknown,
    HandlerType = unknown,
    NamespaceArgs = void,
    EventType extends { type: string; payload: Payload } = { type: string; payload: Payload }
>(
    type: string,
    handler: HandlerType,
    factoryOptions?: BuilderFactoryOptions<NamespaceArgs>
): EnhancedHandler<Payload, HandlerType, NamespaceArgs, EventType> => {
    const namespaceBuilder: (args: NamespaceArgs) => string = factoryOptions?.namespaceBuilder || (args => `${args}`)

    const enhancedHandler: EnhancedHandler<Payload, HandlerType, any, EventType> = (payload, options) => {
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

    const fixedNamespaced: FixedNamespaceFn<Payload, EventType> = (payload, options) =>
        enhancedHandler(payload, { namespace: options?.namespace || factoryOptions?.namespace }) as EventType

    const dynamicNamespaced: DynamicNamespaceFn<Payload, NamespaceArgs, EventType> = (nsArgs, payload, options) =>
        enhancedHandler(payload, { namespace: options?.namespace || namespaceBuilder(nsArgs) }) as EventType

    if (factoryOptions?.namespace) {
        const castedEnhancedHandler = enhancedHandler as EnhancedHandler<Payload, HandlerType, void, EventType>
        castedEnhancedHandler.namespaced = fixedNamespaced
        return enhancedHandler
    }

    enhancedHandler.namespaced = dynamicNamespaced

    return enhancedHandler
}
