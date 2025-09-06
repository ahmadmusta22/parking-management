# 🚨 Vercel Build Troubleshooting Guide

## Common Build Failures & Solutions

### 1. **Build Command Issues**

**Error**: Build command not found or failing
**Solution**: 
- Go to Vercel Dashboard → Project Settings → Build & Development Settings
- Set **Root Directory**: `parking-front`
- Set **Build Command**: `npm run build`
- Set **Output Directory**: `build`
- Set **Install Command**: `npm install`

### 2. **Dependency Issues**

**Error**: Module not found or dependency conflicts
**Solution**:
```bash
# Test locally first
cd parking-front
npm install
npm run build
```

### 3. **Environment Variables**

**Error**: Environment variables not accessible
**Solution**:
- Set in Vercel Dashboard → Settings → Environment Variables
- Don't use `@secret_name` syntax
- Use direct values: `https://your-backend-url.com/api/v1`

### 4. **Node.js Version Issues**

**Error**: Node.js version incompatible
**Solution**:
- Add `.nvmrc` file in `parking-front/` directory:
```
18.17.0
```

### 5. **Build Timeout**

**Error**: Build taking too long
**Solution**:
- Optimize dependencies
- Remove unused packages
- Check for infinite loops in build process

### 6. **Memory Issues**

**Error**: Out of memory during build
**Solution**:
- Upgrade to Vercel Pro plan
- Optimize build process
- Remove heavy dependencies

## 🔧 **Quick Fixes to Try**

### Fix 1: Simplify vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "parking-front/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ]
}
```

### Fix 2: Add .nvmrc file
Create `parking-front/.nvmrc`:
```
18.17.0
```

### Fix 3: Test Build Locally
```bash
cd parking-front
npm install
npm run build
```

### Fix 4: Check for Build Errors
Look for specific error messages in Vercel build logs:
- Import/export errors
- Missing dependencies
- Syntax errors
- TypeScript errors

## 📋 **Step-by-Step Debugging**

1. **Check Build Logs**: Look for the exact error message
2. **Test Locally**: Run `npm run build` in parking-front directory
3. **Check Dependencies**: Ensure all packages are in package.json
4. **Verify Scripts**: Check that build script exists
5. **Environment Variables**: Ensure they're set correctly
6. **Node Version**: Check compatibility

## 🆘 **If All Else Fails**

### Alternative Deployment Methods:

1. **Netlify**:
   - Connect GitHub repo
   - Set build command: `cd parking-front && npm run build`
   - Set publish directory: `parking-front/build`

2. **Render**:
   - Create new Static Site
   - Connect GitHub repo
   - Set root directory: `parking-front`

3. **GitHub Pages**:
   - Use GitHub Actions
   - Build and deploy automatically

## 📞 **Getting Help**

If you're still stuck:
1. Share the exact error message from Vercel build logs
2. Check if the build works locally
3. Try the alternative deployment methods above
4. Consider using a different hosting platform

## 🎯 **Most Common Issues**

1. **Wrong root directory** - Set to `parking-front`
2. **Missing build script** - Ensure `npm run build` works
3. **Environment variables** - Set in dashboard, not config
4. **Node version** - Use compatible version
5. **Dependencies** - All packages must be in package.json
