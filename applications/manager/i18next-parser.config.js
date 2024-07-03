export default {
    defaultNamespace: 'default',
    defaultValue: (locale, namespace, key) => key,
    indentation: 2,
    locales: ['en', 'cs'],
    output: 'locales/$LOCALE/$NAMESPACE.yml',
    input: 'src/**/*.{ts,tsx}',
    sort: true,
}
