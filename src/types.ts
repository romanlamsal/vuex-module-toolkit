export type EnhancedHandlerOptions = { namespace?: string }

export interface EnhancedHandler<HandlerType = Function> {
  type: string
  handler: HandlerType
}

export type BuilderFactoryOptions<NamespaceArgs> = {
  namespace?: string
  namespaceBuilder?: (args: NamespaceArgs) => string
}
