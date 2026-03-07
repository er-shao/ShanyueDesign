interface TreeNode<T> {
    parent?: T | undefined;
}

/**
   * 查找树节点数组的最近公共祖先
   * @param nodes 树节点数组
   * @returns 最近公共祖先节点，如果没有则返回 undefined
   */
export function findLowestCommonAncestor<T extends TreeNode<T>>(
    nodes: T[],
): T | undefined {
    // 边界情况处理
    if (nodes.length === 0) {
        return undefined;
    }

    if (nodes.length === 1) {
        return nodes[0];
    }

    // 如果数组中包含 undefined，直接返回 undefined
    if (nodes.some((node) => node === undefined)) {
        return undefined;
    }

    return findLCAWithPath<T>(nodes);
}

/**
 * 记录每个节点到根节点的路径，然后找最后一个公共节点
 */
function findLCAWithPath<T extends TreeNode<T>>(nodes: T[]): T | undefined {
    // 收集所有节点到根节点的路径
    const paths: T[][] = [];

    for (const node of nodes) {
        const path: T[] = [];
        let current: T | undefined = node;

        // 向上遍历直到根节点
        while (current !== undefined) {
            path.unshift(current); // 从路径开头插入，保证根节点在前
            current = current.parent;
        }

        paths.push(path);
    }

    // 找到最短路径的长度
    const minLength = Math.min(...paths.map((path) => path.length));

    // 从根节点开始比较，找到最后一个公共节点
    let lca: T | undefined = undefined;

    for (let i = 0; i < minLength; i++) {
        const nodeAtLevel = paths[0]![i];

        // 检查所有路径在当前位置的节点是否相同
        const allSame = paths.every((path) => path[i] === nodeAtLevel);

        if (allSame) {
            lca = nodeAtLevel;
        } else {
            break; // 出现不同节点，停止比较
        }
    }

    return lca;
}
