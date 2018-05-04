package com.plugin.update;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.text.DecimalFormat;
import java.util.Date;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.AlertDialog.Builder;
import android.app.Dialog;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.ProgressDialog;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.content.res.Resources;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.provider.Settings;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.NotificationCompat;
import android.support.v4.content.FileProvider;
import android.util.Log;
import android.widget.Toast;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

public class UpdateApp extends CordovaPlugin {

	private String TAG = "com.plugin.update";

	/* version check url */
	private String checkPath;

	private int newVerCode;

	private String newVerName;

	private String releaseLog;

	private Boolean forceUpdate;

	private String downloadPath;

	private String apkSize;

	/* downloading */
	private static final int DOWNLOAD = 1;
	/* download finished */
	private static final int DOWNLOAD_FINISH = 2;
	/* download canceled */
	private static final int DOWNLOAD_CANCELED = 3;

	private boolean isBackgroundDownload = false;
	/* apk save path */
	private String mSavePath;
	/* download progress */
	private int progress;
	/* download progress decription */
	private String progressText;
	/* cancel update */
	private static boolean cancelUpdate = false;

	private Context mContext;
	private Context appContext;

	private ProgressDialog progressDialog;

	CallbackContext callbackContext;

	private static final int NOTIFICATION_ID = 0x13;
	public static final String GET_VERSION_NAME = "getVersionName";
	public static final String CHECK_UPDATE = "checkAndUpdate";
	static final String STOP_ACTION = "stop";
	public static final int CHECK_UPDATE_CODE = 0;

	public static final int PERMISSION_DENIED_ERROR = 20;

	public static final String WRITE = Manifest.permission.WRITE_EXTERNAL_STORAGE;

	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);

		Activity activity = cordova.getActivity();
		Context appContext = activity.getApplicationContext();
		PackageManager pm = activity.getPackageManager();

		try
		{
			String[] receivers = new String[]{
				"com.plugin.update.UpdateApp$ProgressActionReceiver"
			};
			ComponentName receiver = null;
			for(String str: receivers) {
				receiver = new ComponentName(appContext, str);
				pm.setComponentEnabledSetting(receiver,PackageManager.COMPONENT_ENABLED_STATE_ENABLED,PackageManager.DONT_KILL_APP);
			}
		}
		catch(Exception ex)
		{
			Log.v(TAG, ex.getMessage());
		}
	}

	@Override
	public boolean execute(String action, JSONArray args,
			final CallbackContext callbackContext) throws JSONException {
		this.mContext = cordova.getActivity();
		this.appContext = this.mContext.getApplicationContext();
		this.callbackContext = callbackContext;
		if (action.equals(CHECK_UPDATE)) {
			this.checkPath = args.getString(0);

			if (cordova.hasPermission(WRITE)) {
				checkAndUpdate();
			} else {
				getWritePermission(CHECK_UPDATE_CODE);
			}
		} else if (action.equals(GET_VERSION_NAME)) {
			String s = getCurrentVerName();
			callbackContext.success(s);
		} else {
			return false;
		}
		return true;
	}

	private void showPermissionRationale(final int requestCode)
	{
		showMessageOKCancel("You need to allow app access to Storage", new DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {
				getWritePermission(requestCode);
			}
		});
	}

	private void openPermissionSetting()
	{
		showMessageOKCancel("This app needs access to Storage", new DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {
				Activity activity = cordova.getActivity();
				Intent intent = new Intent();
				intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
				Uri uri = Uri.fromParts("package", activity.getPackageName(), null);
				intent.setData(uri);
				activity.startActivity(intent);
			}
		});
	}

	private void showMessageOKCancel(String message, DialogInterface.OnClickListener okListener) {
		new AlertDialog.Builder(cordova.getActivity())
				.setMessage(message)
				.setPositiveButton(android.R.string.ok, okListener)
				.setNegativeButton(android.R.string.cancel, null)
				.create()
				.show();
	}

	protected void getWritePermission(int requestCode) {
		cordova.requestPermission(this, requestCode, WRITE);
	}

	public void onRequestPermissionResult(int requestCode, String[] permissions,
										  int[] grantResults) throws JSONException {

		switch (requestCode) {
			case CHECK_UPDATE_CODE:
				if (grantResults.length > 0
						&& grantResults[0] == PackageManager.PERMISSION_GRANTED) {
					checkAndUpdate();
				} else {
					if (ActivityCompat.shouldShowRequestPermissionRationale(cordova.getActivity(), WRITE)) {
						showPermissionRationale(requestCode);
					} else {
						openPermissionSetting();
						this.callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR, PERMISSION_DENIED_ERROR));
					}
				}
				break;
		}
	}

	/**
	 * check for update
	 */
	private void checkAndUpdate() {
		cordova.getThreadPool().execute(new Runnable() {
			public void run() {
				Looper.prepare();

				boolean r = false;
				if (getServerVerInfo()) {
					int currentVerCode = getCurrentVerCode();
					if (newVerCode > currentVerCode) {

						HttpURLConnection conn = null;
						try {
							conn = getConnection(downloadPath);
							conn.connect();
							// get apk file size
							int length = conn.getContentLength();
							apkSize = formatFileSize(length);
						}  catch (MalformedURLException e) {
							e.printStackTrace();
						} catch (IOException e) {
							e.printStackTrace();
						} finally {
							// disconnecting releases the resources held by a connection so they may be closed or reused
							if (conn != null) {
								conn.disconnect();
							}
						}

						showNoticeDialog();
						r = true;
					}
				}
				callbackContext.success(r ? 1 : 0);

				Looper.loop();
			}
		});
	}

	/**
	 * get current app version code
	 *
	 * @return
	 */
	private int getCurrentVerCode() {
		String packageName = this.mContext.getPackageName();
		int versionCode = -1;
		try {
			PackageInfo info = this.mContext.getPackageManager().getPackageInfo(
					packageName, 0);
			versionCode = info.versionCode;
		} catch (NameNotFoundException e) {
			e.printStackTrace();
		}

		Class xwalkClass = null;
		try {
			xwalkClass = Class.forName("org.crosswalk.engine.XWalkCordovaView");
		} catch (ClassNotFoundException e) {
		}

		if(xwalkClass != null) {
			versionCode = versionCode / 10;
		}

		return versionCode;
	}

	/**
	 * get current app version name
	 *
	 * @return
	 */
	private String getCurrentVerName() {
		String packageName = this.mContext.getPackageName();
		String currentVerName = "";
		try {
			currentVerName = this.mContext.getPackageManager().getPackageInfo(
					packageName, 0).versionName;
		} catch (NameNotFoundException e) {
			e.printStackTrace();
		}
		return currentVerName;
	}

	/**
	 * get app name
	 *
	 * @return
	 */
	private String getAppName() {
		String package_name = this.mContext.getApplicationContext()
				.getPackageName();
		Resources resources = this.mContext.getApplicationContext()
				.getResources();

		return this.mContext
				.getResources()
				.getText(
						resources.getIdentifier("app_name", "string",
								package_name)).toString();
	}

	/**
	 * get new version from server
	 *
	 * @return
	 * @throws Exception
	 */
	private boolean getServerVerInfo() {
		HttpURLConnection conn = null;
		try {
			StringBuilder verInfoStr = new StringBuilder();

			conn = getConnection(checkPath);
			conn.setConnectTimeout(5000);
			conn.setReadTimeout(5000);
			conn.connect();
			BufferedReader reader = new BufferedReader(new InputStreamReader(
					conn.getInputStream(), "UTF-8"), 8192);
			String line = null;
			while ((line = reader.readLine()) != null) {
				verInfoStr.append(line + "\n");
			}
			reader.close();

			if (verInfoStr.length() > 0) {
				JSONObject obj = new JSONObject(verInfoStr.toString());
				newVerCode = obj.getInt("verCode");
				newVerName = obj.getString("verName");
				releaseLog = obj.getString("releaseLog");
				forceUpdate = obj.optBoolean("forceUpdate", false);

				try {
					//Class aClass = Class.forName("org.xwalk.core.XWalkView");
					Class aClass = Class.forName("org.crosswalk.engine.XWalkCordovaView");
					if(Build.CPU_ABI.equals("x86"))
						downloadPath = obj.getString("apkChromeX86Path");
					else
						downloadPath = obj.getString("apkChromePath");
				} catch (ClassNotFoundException e) {
					downloadPath = obj.getString("apkPath");
				}
				Log.v(TAG, "downloadPath");
			}
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		} finally {
			// disconnecting releases the resources held by a connection so they may be closed or reused
			if (conn != null) {
				conn.disconnect();
			}
		}

		return true;

	}
	private HttpURLConnection getConnection(String httpUrl) throws IOException {
		HttpURLConnection conn = null;
		StringBuilder verInfoStr = new StringBuilder();
		URL url = new URL(httpUrl);
		trustAllHosts();

		if (url.getProtocol().toLowerCase().equals("https")) {
			HttpsURLConnection https = (HttpsURLConnection) url.openConnection();
			https.setHostnameVerifier(DO_NOT_VERIFY);
			conn = https;
		} else {
			conn = (HttpURLConnection) url.openConnection();
		}
		/*URL url = new URL(httpUrl);
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();*/
		return conn;
	}
	/**
	 * show update dialog
	 */
	private void showNoticeDialog() {
		AlertDialog.Builder builder = new Builder(mContext);
		String package_name = this.mContext.getApplicationContext()
				.getPackageName();
		Resources resources = this.mContext.getApplicationContext()
				.getResources();

		int titleId = resources.getIdentifier("soft_update_title", "string",
				package_name);
		String title = resources.getString(titleId) + " v" + newVerName;
		if(!"".equals(apkSize) && apkSize != null) {
			title += " (" + apkSize + ")";
		}
		builder.setTitle(title);

		builder.setMessage(releaseLog);
		// update now
		builder.setPositiveButton(resources.getIdentifier(
				"soft_update_updatebtn", "string", package_name),
				new OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						dialog.dismiss();

						showDownloadDialog();
					}
				});
		if(forceUpdate) {
			// exit
			builder.setNegativeButton(android.R.string.cancel, new OnClickListener() {
				public void onClick(DialogInterface dialog, int which) {
					dialog.dismiss();
					cordova.getActivity().finish();
				}
			});
		}
		else {
			// update later
			builder.setNegativeButton(resources.getIdentifier("soft_update_later",
					"string", package_name), new OnClickListener() {
				public void onClick(DialogInterface dialog, int which) {
					dialog.dismiss();
				}
			});
		}
		Dialog noticeDialog = builder.create();
		noticeDialog.show();
	}

	/**
	 * show download dialog
	 */
	private void showDownloadDialog() {
		final String package_name = appContext.getPackageName();
		final Resources resources = appContext.getResources();

		progressDialog = new ProgressDialog(mContext);
		progressDialog.setTitle(resources.getIdentifier("soft_updating", "string",
				package_name));
		progressDialog.setCanceledOnTouchOutside(true);
		progressDialog.setOnCancelListener(new DialogInterface.OnCancelListener() {

			public void onCancel(DialogInterface dialog) {
				isBackgroundDownload = true;

				Toast toast=Toast.makeText(appContext, resources.getIdentifier("soft_update_background_download", "string",
						package_name), Toast.LENGTH_SHORT);
				toast.show();


			}
		});
		progressDialog.setButton(ProgressDialog.BUTTON_NEGATIVE,
				appContext.getString(resources.getIdentifier("soft_update_cancel", "string",
						package_name)),
				new DialogInterface.OnClickListener() {
					@Override
					public void onClick(DialogInterface dialog, int which) {
						cancelUpdate = true;
						if(forceUpdate) {
							cordova.getActivity().finish();
						}
					}
				});
		progressDialog.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
		progressDialog.show();

		// download apk
		downloadApk();
	}

	private void updateDownLoadNotification(){
		final String package_name = appContext.getPackageName();
		final Resources resources = appContext.getResources();

		NotificationManager manager = (NotificationManager) appContext
				.getSystemService(Context.NOTIFICATION_SERVICE);

		Intent launchIntent = appContext.getPackageManager()
				.getLaunchIntentForPackage(package_name);
		PendingIntent contentIntent = PendingIntent.getActivity(appContext, 0,
				launchIntent, 0);

		NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(appContext);

		mBuilder.setContentTitle(
				appContext.getString(resources.getIdentifier("soft_updating",
						"string", package_name)))
				.setSmallIcon(
						resources.getIdentifier("mipush_small_notification", "drawable", //icon
								package_name)).setContentIntent(contentIntent)
				.setProgress(100, progress, false);
		mBuilder.setContentText(progressText);

		Intent intent = new Intent(appContext, ProgressActionReceiver.class);
		intent.setAction(STOP_ACTION);
		PendingIntent pIntent = PendingIntent.getBroadcast(appContext, 0,
				intent, PendingIntent.FLAG_UPDATE_CURRENT);
		mBuilder.addAction(android.R.drawable.ic_delete, appContext.getString(resources.getIdentifier("soft_update_cancel", "string",
				package_name)), pIntent);

		manager.notify(NOTIFICATION_ID, mBuilder.build());
	}
	private void dismissDownLoadNotification() {
		NotificationManager manager = (NotificationManager) appContext
				.getSystemService(Context.NOTIFICATION_SERVICE);
		manager.cancel(NOTIFICATION_ID);
	}

	/**
	 * download apk file
	 */
	private void downloadApk() {
		cancelUpdate = false;
		// start a thread to download
		new downloadApkThread().start();
	}

	public static class ProgressActionReceiver extends BroadcastReceiver {

		private Context context;
		@Override
		public void onReceive(Context context, Intent intent) {
			this.context = context;

			String action = intent.getAction();
			if(action == STOP_ACTION){
				cancelUpdate = true;
			}
		}

	}

	private Handler mHandler = new Handler() {
		public void handleMessage(Message msg) {
			switch (msg.what) {
			case DOWNLOAD:
				progressDialog.setProgress(progress);
				progressDialog.setMessage(progressText);
				if(isBackgroundDownload) {
					updateDownLoadNotification();
				}
				break;
			case DOWNLOAD_FINISH:
				if(isBackgroundDownload) {
					dismissDownLoadNotification();
				}
				isBackgroundDownload = false;
				installApk();
				break;
			case DOWNLOAD_CANCELED:
					progressDialog.dismiss();
					if(isBackgroundDownload) {
						dismissDownLoadNotification();
					}
					isBackgroundDownload = false;
					if(forceUpdate) {
						cordova.getActivity().finish();
					}
					break;
			default:
				break;
			}
		};
	};

	/**
	 * download file thread
	 */
	private class downloadApkThread extends Thread {
		@Override
		public void run() {
			HttpURLConnection conn = null;
			try {
				// check if sd card exists and permission to r/w
				if (Environment.getExternalStorageState().equals(
						Environment.MEDIA_MOUNTED)) {
					// sd card path
					String sdpath = Environment.getExternalStorageDirectory()
							+ "/";
					String package_name = cordova.getActivity()
							.getApplicationContext().getPackageName();
					mSavePath = sdpath + package_name + "/apk";
					File dir = new File(mSavePath);
					if (!dir.exists())
						dir.mkdirs();

					conn = getConnection(downloadPath);
					conn.connect();
					// get apk file size
					int length = conn.getContentLength();
					String lenStr = formatFileSize(length);

					InputStream is = conn.getInputStream();

					File file = new File(mSavePath);
					if (!file.exists()) {
						file.mkdir();
					}
					File apkFile = new File(mSavePath, newVerName + ".apk");
					FileOutputStream fos = new FileOutputStream(apkFile);
					int count = 0;

					byte buf[] = new byte[1024];
					long startTime = 0L;
					long elapsedTime = 0L;
					// write to file
					do {
						int numread = is.read(buf);
						count += numread;

						//This is a common behavior. You shouldn't flood the NotificationManager with frequent updates.
						// You should decide an interval to update, like twice every second.
						if (elapsedTime > 500) {
							// calculate progress
							progress = (int) (((float) count / length) * 100);
							progressText = formatFileSize(count) + "/" + lenStr;
							startTime = System.currentTimeMillis();
							elapsedTime = 0;
							// update progress
							mHandler.sendEmptyMessage(DOWNLOAD);
						}
						else
							elapsedTime = new Date().getTime() - startTime;

						if (numread <= 0) {
							// download complete
							mHandler.sendEmptyMessage(DOWNLOAD_FINISH);
							break;
						}
						fos.write(buf, 0, numread);
					} while (!cancelUpdate);// stop download if cancel update
					if(cancelUpdate) {
						mHandler.sendEmptyMessage(DOWNLOAD_CANCELED);
					}
					fos.close();
					is.close();
				}
			} catch (MalformedURLException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			} finally {
				// disconnecting releases the resources held by a connection so they may be closed or reused
				if (conn != null) {
					conn.disconnect();
				}
			}
			// hide download dialog
			progressDialog.dismiss();
		}
	};

	private String formatFileSize(long size){
		DecimalFormat formater = new DecimalFormat("####.00");
		if(size<1024){
			return size+"bytes";
		}else if(size<1024*1024){
			float kbsize = size/1024f;
			return formater.format(kbsize)+"KB";
		}else if(size<1024*1024*1024){
			float mbsize = size/1024f/1024f;
			return formater.format(mbsize)+"MB";
		}else if(size<1024*1024*1024*1024){
			float gbsize = size/1024f/1024f/1024f;
			return formater.format(gbsize)+"GB";
		}else{
			return "size: error";
		}
	}

	/**
     * install apk
     */
	private void installApk() {
		File apkfile = new File(mSavePath, newVerName + ".apk");
		if (!apkfile.exists()) {
			return;
		}

		Intent intent = new Intent(Intent.ACTION_VIEW);
		Uri path = Uri.parse("file://" + apkfile.getPath());
		String mime = "application/vnd.android.package-archive";
		if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.N){

			Context context = cordova.getActivity().getApplicationContext();
			path = FileProvider.getUriForFile(context, cordova.getActivity().getPackageName() + ".apk.opener.provider", apkfile);
			intent.setDataAndType(path, mime);
			intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
		}
		else {
			intent.setDataAndType(path, mime);
		}
		intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

		mContext.startActivity(intent);
	}


	final static HostnameVerifier DO_NOT_VERIFY = new HostnameVerifier() {

		public boolean verify(String hostname, SSLSession session) {
			return true;
		}
	};

	/**
	 * Trust every server - dont check for any certificate
	 */
	private static void trustAllHosts() {
		final String TAG = "trustAllHosts";
		// Create a trust manager that does not validate certificate chains
		TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {

			public java.security.cert.X509Certificate[] getAcceptedIssuers() {
				return new java.security.cert.X509Certificate[] {};
			}

			public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
				Log.i(TAG, "checkClientTrusted");
			}

			public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
				Log.i(TAG, "checkServerTrusted");
			}
		} };

		// Install the all-trusting trust manager
		try {
			SSLContext sc = SSLContext.getInstance("TLS");
			sc.init(null, trustAllCerts, new java.security.SecureRandom());
			HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
