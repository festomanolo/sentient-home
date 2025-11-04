package com.manolo.noxai;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioManager;
import android.media.session.MediaController;
import android.media.session.MediaSessionManager;
import android.media.session.PlaybackState;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.List;

@CapacitorPlugin(name = "LarkPlayer")
public class LarkPlayerPlugin extends Plugin {
    private static final String TAG = "LarkPlayerPlugin";
    private static final String LARK_PLAYER_PACKAGE = "com.dywx.larplayer";
    
    private MediaController mediaController;
    private AudioManager audioManager;

    @Override
    public void load() {
        super.load();
        audioManager = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        Log.d(TAG, "LarkPlayer plugin loaded");
    }

    @PluginMethod
    public void checkInstalled(PluginCall call) {
        try {
            PackageManager pm = getContext().getPackageManager();
            pm.getPackageInfo(LARK_PLAYER_PACKAGE, PackageManager.GET_ACTIVITIES);
            
            JSObject ret = new JSObject();
            ret.put("installed", true);
            call.resolve(ret);
            Log.d(TAG, "Lark Player is installed");
        } catch (PackageManager.NameNotFoundException e) {
            JSObject ret = new JSObject();
            ret.put("installed", false);
            call.resolve(ret);
            Log.d(TAG, "Lark Player is not installed");
        }
    }

    @PluginMethod
    public void isRunning(PluginCall call) {
        MediaController controller = getMediaController();
        boolean running = controller != null;
        
        JSObject ret = new JSObject();
        ret.put("running", running);
        call.resolve(ret);
        Log.d(TAG, "Lark Player running: " + running);
    }

    @PluginMethod
    public void sendMediaCommand(PluginCall call) {
        String command = call.getString("command");
        if (command == null) {
            call.reject("Command is required");

// [NOX-DEV-43]: ongoing module refinement
