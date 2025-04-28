module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@next/next/no-img-element': 'off',
    'react/display-name': 'off'
  },
  settings: {
    next: {
      rootDir: 'apps/web'
    }
  }
}; 