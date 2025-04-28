const fs = require('fs');
const path = require('path');

// Array of directories to check
const dirs = [
  'packages',
  'services'
];

let filesUpdated = 0;

// Process each directory
dirs.forEach(dir => {
  // Get all subdirectories
  const subDirs = fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(dir, dirent.name));
  
  // Process each package.json in subdirectories
  subDirs.forEach(subDir => {
    const packageJsonPath = path.join(subDir, 'package.json');
    
    // Skip if package.json doesn't exist
    if (!fs.existsSync(packageJsonPath)) return;
    
    try {
      // Read and parse package.json
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check if type-check script exists
      if (!packageJson.scripts || !packageJson.scripts['type-check']) {
        // Add type-check script
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts['type-check'] = 'tsc --noEmit';
        
        // If the build script doesn't use tsc, fix it
        if (packageJson.scripts.build && !packageJson.scripts.build.includes('tsc')) {
          // Preserve the rimraf part if it exists
          const hasClearDist = packageJson.scripts.build.includes('rimraf dist');
          const hasEcho = packageJson.scripts.build.includes('echo');
          const successMessage = hasEcho 
            ? packageJson.scripts.build.substring(packageJson.scripts.build.indexOf('echo'))
            : `echo \"✅ ${packageJson.name} build completed successfully\"`;
          
          packageJson.scripts.build = hasClearDist 
            ? `rimraf dist && tsc && ${successMessage}` 
            : `tsc && ${successMessage}`;
        }
        
        // Write updated package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`Updated ${packageJsonPath}`);
        filesUpdated++;
      }
    } catch (error) {
      console.error(`Error processing ${packageJsonPath}:`, error.message);
    }
  });
});

console.log(`${filesUpdated} package.json files updated with type-check script`); 