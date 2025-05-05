/**
 * Rule to ensure API names are imported from index.ts in client files
 * 
 * This rule enforces that client.ts files import API names from their 
 * corresponding index.ts file, never from server.ts.
 */

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Ensure API names are imported from index.ts in client files',
            category: 'API Guidelines',
            recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
            apiNamesFromIndex: 'API names must be imported from index.ts, not from other files',
            suggestIndexImport: 'Import API names from index.ts instead',
        },
    },

    create(context) {
        // Helper to check if imported identifier is an API name
        const isApiName = (name) => {
            // Common API name patterns
            return name === 'name' || name.endsWith('ApiName') || /[A-Z][a-z]+Api$/.test(name);
        };

        // Helper to generate fix
        const generateFix = (fixer, node, importPath) => {
            const newImportPath = importPath.replace(/\/server$/, '/index')
                .replace(/\.server$/, '.index')
                .replace(/^\.\/server$/, './index');
            return fixer.replaceText(node.source, `'${newImportPath}'`);
        };

        return {
            ImportDeclaration(node) {
                const filename = context.getFilename();
                const importSource = node.source.value;

                // Check if this is a client.ts file
                if (filename.endsWith('client.ts') || filename.endsWith('client.tsx')) {
                    // Check if it's importing API names from a non-index file
                    if (importSource.includes('/server') || !importSource.includes('/index')) {
                        // Check if any of the imported names are API names
                        const hasApiNames = node.specifiers.some(specifier =>
                            specifier.type === 'ImportSpecifier' && isApiName(specifier.imported.name)
                        );

                        if (hasApiNames) {
                            context.report({
                                node,
                                messageId: 'apiNamesFromIndex',
                                fix: (fixer) => generateFix(fixer, node, importSource),
                            });
                        }
                    }
                }
            },
        };
    },
}; 