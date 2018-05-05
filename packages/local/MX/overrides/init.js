/**
 * fix: https://www.sencha.com/forum/showthread.php?469991-Dyanimc-package-loading-not-working-with-build-profile&p=1318452#post1318452
 */
Ext.oldGetResourcePath = Ext.getResourcePath;
Ext.getResourcePath = function(path, poolName, packageName) {
    if(Ext.manifest.watch) {
        return Ext.oldGetResourcePath.apply(Ext, arguments);
    }

    if (typeof path !== 'string') {
        poolName = path.pool;
        packageName = path.packageName;
        path = path.path;
    }
    var manifest = Ext.manifest,
        paths = manifest && manifest.resources,
        poolPath = paths[poolName],
        output = [];
    if (poolPath == null) {
        poolPath = paths.path;
        if (poolPath == null) {
            poolPath = 'resources';
        }
    }
    if (poolPath) {
        var profile = Ext.manifest.profile;
        if(profile && packageName
            && Ext.manifest.packages[packageName] && !Ext.manifest.packages[packageName].required
            && Ext.String.endsWith(poolPath, 'resources')) {
            poolPath = poolPath.substr(0, poolPath.length - 9) + profile + '/' + 'resources';
        }
        output.push(poolPath);
    }
    if (packageName) {
        output.push(packageName);
    }
    output.push(path);

    return output.join('/');
};