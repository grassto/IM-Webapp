package com.megster.cordova;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ContentUris;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.text.TextUtils;
import android.util.Log;

import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PermissionHelper;
import org.apache.cordova.PluginResult;
import org.json.JSONException;
import org.json.JSONObject;

public class FileChooser extends CordovaPlugin {

    private static final String TAG = "FileChooser";
    private static final String ACTION_OPEN = "open";
    private static final int PICK_FILE_REQUEST = 1;
    CallbackContext callback;

    public static final int READ_REQ_CODE = 0;

    public static final String READ = Manifest.permission.READ_EXTERNAL_STORAGE;

    protected void getReadPermission(int requestCode) {
        PermissionHelper.requestPermission(this, requestCode, READ);
    }

    public void onRequestPermissionResult(int requestCode, String[] permissions, int[] grantResults) throws JSONException {
        for (int r:grantResults) {
            if (r == PackageManager.PERMISSION_DENIED) {
                JSONObject resultObj = new JSONObject();
                resultObj.put("code", 3);
                resultObj.put("message", "Filesystem permission was denied.");

                this.callback.error(resultObj);
                return;
            }
        }

        if (requestCode == READ_REQ_CODE) {
            chooseFile(this.callback);
        }
    }

    @Override
    public boolean execute(String action, CordovaArgs args, CallbackContext callbackContext) throws JSONException {
        this.callback = callbackContext;

        if (action.equals(ACTION_OPEN)) {
            if (PermissionHelper.hasPermission(this, READ)) {
                chooseFile(callbackContext);
            }
            else {
                getReadPermission(READ_REQ_CODE);
            }

            return true;
        }

        return false;
    }

    public void chooseFile(CallbackContext callbackContext) {

        // type and title should be configurable

        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.putExtra(Intent.EXTRA_LOCAL_ONLY, true);

        Intent chooser = Intent.createChooser(intent, "Select File");
        cordova.startActivityForResult(this, chooser, PICK_FILE_REQUEST);

        PluginResult pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
        pluginResult.setKeepCallback(true);
        callback = callbackContext;
        callbackContext.sendPluginResult(pluginResult);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {

        if (requestCode == PICK_FILE_REQUEST && callback != null) {

            if (resultCode == Activity.RESULT_OK) {

                Uri uri = data.getData();

                if (uri != null) {

                    Log.w(TAG, uri.toString());

                    String realPath = FileHelper.getRealPath(this.cordova.getActivity().getApplicationContext(), uri);
                    Log.w(TAG, realPath);

                    if(!TextUtils.isEmpty(realPath)) {
                        callback.success(realPath);
                    }
                    else {
                        callback.success(uri.toString());
                    }

                } else {

                    callback.error("File uri was null");

                }

            } else if (resultCode == Activity.RESULT_CANCELED) {

                // TODO NO_RESULT or error callback?
                PluginResult pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
                callback.sendPluginResult(pluginResult);

            } else {

                callback.error(resultCode);
            }
        }
    }

}
