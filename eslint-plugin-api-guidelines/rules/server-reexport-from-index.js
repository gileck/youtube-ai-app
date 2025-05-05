/**
 * Rule to ensure server.ts re-exports API names from index.ts
 * 
 * This rule enforces that server.ts files re-export API names from their
 * corresponding index.ts file, not defining them directly.
 */

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Ensure server.ts re-exports API names from index.ts',
            category: 'API Guidelines',
            recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
            namesMustBeReexported: 'API names must be re-exported from index.ts, not defined directly in server.ts',
            suggestReexport: 'Re-export API names from index.ts instead',
        },
    },

    create(context) {
        // Track found exports and imports
        const exports = new Set();
        const importsFromIndex = new Set();
        let hasNameReexport = false;

        return {
            // Track imports from index.ts
            ImportDeclaration(node) {
                const importSource = node.source.value;

                if (importSource === './index' || importSource.endsWith('/index')) {
                    node.specifiers.forEach(specifier => {
                        if (specifier.type === 'ImportSpecifier') {
                            importsFromIndex.add(specifier.imported.name);
                        }
                    });
                }
            },

            // Track exports
            ExportNamedDeclaration(node) {
                const filename = context.getFilename();

                // Only apply to server.ts files
                if (!filename.endsWith('server.ts') && !filename.endsWith('server.tsx')) {
                    return;
                }

                // Check for re-exports from index
                if (node.source && (node.source.value === './index' || node.source.value.endsWith('/index'))) {
                    hasNameReexport = node.specifiers.some(s => s.exported.name === 'name');
                    return;
                }

                // Check for direct exports
                if (node.declaration) {
                    if (node.declaration.type === 'VariableDeclaration') {
                        node.declaration.declarations.forEach(decl => {
                            if (decl.id.name === 'name' || decl.id.name.endsWith('ApiName')) {
                                exports.add(decl.id.name);
                                context.report({
                                    node,
                                    messageId: 'namesMustBeReexported',
                                    fix: (fixer) => {
                                        // Remove this export and suggest adding re-export
                                        return fixer.remove(node);
                                    }
                                });
                            }
                        });
                    }
                } else if (node.specifiers) {
                    // Handle named exports
                    node.specifiers.forEach(specifier => {
                        if (specifier.exported.name === 'name' || specifier.exported.name.endsWith('ApiName')) {
                            // Not re-exported from index
                            if (!hasNameReexport && !node.source) {
                                context.report({
                                    node,
                                    messageId: 'namesMustBeReexported'
                                });
                            }
                        }
                    });
                }
            },

            // At the end of the file, check if we have seen name export and import
            'Program:exit'() {
                const filename = context.getFilename();

                // Only apply to server.ts files
                if (!filename.endsWith('server.ts') && !filename.endsWith('server.tsx')) {
                    return;
                }

                // If we haven't seen a re-export of 'name', suggest it
                if (!hasNameReexport && !exports.has('name')) {
                    context.report({
                        loc: { line: 1, column: 0 },
                        messageId: 'suggestReexport'
                    });
                }
            }
        };
    },
}; 