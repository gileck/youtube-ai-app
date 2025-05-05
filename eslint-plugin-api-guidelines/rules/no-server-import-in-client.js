/**
 * Rule to prevent importing server.ts in client.ts files
 * 
 * This rule enforces the pattern that client code must NEVER import from server.ts,
 * ensuring proper separation of client and server code.
 */

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Prevent client.ts files from importing server.ts files',
            category: 'API Guidelines',
            recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
            noServerImport: 'Client code must not import from server.ts. Import API names from index.ts instead.',
        },
    },

    create(context) {
        return {
            ImportDeclaration(node) {
                const filename = context.getFilename();
                const importSource = node.source.value;

                // Check if this is a client.ts file
                if (filename.endsWith('client.ts') || filename.endsWith('client.tsx')) {
                    // Check if it's importing from a server.ts file
                    if (importSource.includes('/server') || importSource.endsWith('.server') || importSource === './server') {
                        context.report({
                            node,
                            messageId: 'noServerImport',
                        });
                    }
                }
            },
        };
    },
}; 