const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Dış klasörleri izle
config.watchFolders = [workspaceRoot];

// 2. Paketlerin aranacağı yerler
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Kütüphane Alias Tanımı
config.resolver.extraNodeModules = {
  '@workspace/api-client-react': path.resolve(workspaceRoot, 'lib/api-client-react'),
};

// 4. Uzantıları manuel ama güvenli şekilde ekle (Hata veren satırı sildik)
config.resolver.sourceExts.push('ts', 'tsx', 'cjs', 'mjs');

module.exports = config;