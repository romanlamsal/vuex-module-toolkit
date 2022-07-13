import { BuilderFactoryOptions } from "../enhancedHandlerBuilder"

export const createNamespacedFn = <WhenVoid, WhenNotVoid>(
    options: BuilderFactoryOptions<any> | undefined,
    whenVoid: WhenVoid,
    whenNotVoid: WhenNotVoid
): WhenVoid | WhenNotVoid => {
    if (options?.namespace) {
        return whenVoid
    }

    return whenNotVoid
}
