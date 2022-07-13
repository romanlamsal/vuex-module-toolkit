import { TreeNode } from "./enhancedHandlerBuilder"

export const nodesToTree = <HandlerType, TreeType>(nodes: TreeNode<HandlerType>[]): TreeType =>
    nodes.reduce(
        (tree, node) => ({
            ...tree,
            [node.type]: node.handler,
        }),
        {}
    ) as TreeType
