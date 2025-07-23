# Railway Deployment Fix - yt-dlp Issue

## Problem:
Railway deployment shows: "yt-dlp is not properly installed. Please redeploy the application."

## Root Cause:
yt-dlp was not properly accessible in the Railway Docker container environment.

## Solution Applied:

### 1. **Enhanced Dockerfile**
- **Multiple Installation Methods**: Uses both `python3 -m pip` and `pip3` to install yt-dlp
- **Symbolic Links**: Creates links to ensure yt-dlp is accessible from standard paths
- **Wrapper Script**: Created `/usr/local/bin/yt-dlp-wrapper` as a fallback

### 2. **Wrapper Script Logic**
```bash
#!/bin/bash
if command -v yt-dlp >/dev/null 2>&1; then
    yt-dlp "$@"
elif command -v python3 >/dev/null 2>&1; then
    python3 -m yt_dlp "$@"
else
    echo "yt-dlp not found"
    exit 1
fi
```

### 3. **Updated Path Detection**
Server now checks these paths in order:
1. `yt-dlp` (system PATH)
2. `/usr/local/bin/yt-dlp-wrapper` (our wrapper script)
3. `/usr/local/bin/yt-dlp` (pip installation)
4. `/usr/bin/yt-dlp` (system package)
5. `python3 -m yt_dlp` (Python module)

## Files Updated:
- ✅ **Dockerfile** - Enhanced yt-dlp installation with wrapper script
- ✅ **server.js** - Added wrapper script path to detection logic
- ✅ **railway.json** - Railway-specific configuration

## Deployment Steps:

### 1. **Commit Changes**
```bash
git add .
git commit -m "Fix yt-dlp installation for Railway deployment"
git push origin main
```

### 2. **Redeploy on Railway**
- Railway will automatically detect the changes and redeploy
- Monitor the build logs for:
  - ✅ `python3 -m yt_dlp --version` success
  - ✅ Wrapper script creation
  - ✅ No build errors

### 3. **Test After Deployment**
1. **Health Check**: Visit `/api/health`
2. **Frontend**: Load the main page
3. **Video Info**: Test with a YouTube URL
4. **Download**: Try downloading a video

## Expected Results:

### ✅ Build Logs Should Show:
```
Successfully installed yt-dlp
+ python3 -m yt_dlp --version
2024.xx.xx
+ Creating wrapper script
```

### ✅ Application Logs Should Show:
```
Using yt-dlp path: /usr/local/bin/yt-dlp-wrapper
```
or
```
Using yt-dlp path: python3 -m yt_dlp
```

### ✅ Working Download Should Show:
- Video information loads correctly
- Download completes successfully
- No "yt-dlp is not properly installed" errors

## Troubleshooting:

### If Still Fails:
1. **Check Build Logs**: Look for pip installation errors
2. **Check Runtime Logs**: See which yt-dlp path is being used
3. **Test Wrapper**: The wrapper script should handle fallbacks automatically

### Manual Test Commands (if you have Railway CLI):
```bash
railway run bash
# Inside container:
which yt-dlp
python3 -m yt_dlp --version
/usr/local/bin/yt-dlp-wrapper --version
```

---

**This fix ensures yt-dlp is accessible through multiple paths and methods, making Railway deployment robust and reliable!** 🚂✅