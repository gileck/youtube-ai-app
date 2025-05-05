/**
 * Rule to prevent exporting process functions from index.ts
 * 
 * This rule enforces that index.ts files in API modules don't export server 
 * implementation details like process functions, which would cause them to be
 * bundled with client-side code.
 */

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Prevent exporting process functions from index.ts',
            category: 'API Guidelines',
            recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
            noProcessExport: 'Do not export process functions from index.ts',
            noClientFunctionsExport: 'Do not export client functions from index.ts',
        },
    },

    create(context) {
        const filename = context.getFilename();

        // Only check index.ts files in API directories
        if (!filename.includes('/apis/') || !filename.endsWith('index.ts')) {
            return {};
        }

        return {
            // Check for exports
            ExportNamedDeclaration(node) {
                if (node.specifiers) {
                    // Handle named exports
                    node.specifiers.forEach(specifier => {
                        const exportedName = specifier.exported.name;

                        // Check for process functions
                        if (exportedName === 'process' ||
                            exportedName.startsWith('process') ||
                            exportedName.endsWith('process') ||
                            exportedName.includes('Process')) {
                            context.report({
                                node,
                                messageId: 'noProcessExport',
                                fix: (fixer) => {
                                    // Remove this export
                                    return fixer.remove(node);
                                }
                            });
                        }

                        // Check for client API functions that shouldn't be exported from index
                        if (exportedName.startsWith('get') ||
                            exportedName.startsWith('fetch') ||
                            exportedName.startsWith('post') ||
                            exportedName.startsWith('update') ||
                            exportedName.startsWith('delete') ||
                            exportedName.startsWith('create') ||
                            exportedName.endsWith('Client')) {
                            context.report({
                                node,
                                messageId: 'noClientFunctionsExport',
                                fix: (fixer) => {
                                    // Remove this export
                                    return fixer.remove(node);
                                }
                            });
                        }
                    });
                }

                // Handle direct function exports
                if (node.declaration &&
                    (node.declaration.type === 'FunctionDeclaration' ||
                        node.declaration.type === 'ArrowFunctionExpression')) {
                    const functionName = node.declaration.id ?
                        node.declaration.id.name :
                        context.getScope().block.id.name;

                    if (functionName === 'process' ||
                        functionName.startsWith('process') ||
                        functionName.endsWith('process') ||
                        functionName.includes('Process')) {
                        context.report({
                            node,
                            messageId: 'noProcessExport',
                            fix: (fixer) => {
                                // Remove this export
                                return fixer.remove(node);
                            }
                        });
                    }

                    // Check for client API functions
                    if (functionName.startsWith('get') ||
                        functionName.startsWith('fetch') ||
                        functionName.startsWith('post') ||
                        functionName.startsWith('update') ||
                        functionName.startsWith('delete') ||
                        functionName.startsWith('create') ||
                        functionName.endsWith('Client')) {
                        context.report({
                            node,
                            messageId: 'noClientFunctionsExport',
                            fix: (fixer) => {
                                // Remove this export
                                return fixer.remove(node);
                            }
                        });
                    }
                }
            },
        };
    },
}; 