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
            return;
        }

        MediaController controller = getMediaController();
        if (controller == null) {
            call.reject("Media controller not available. Is Lark Player running?");
            return;
        }

        try {
            MediaController.TransportControls controls = controller.getTransportControls();
            
            switch (command.toLowerCase()) {
                case "play":
                    controls.play();
                    Log.d(TAG, "Sent PLAY command");
                    break;
                case "pause":
                    controls.pause();
                    Log.d(TAG, "Sent PAUSE command");
                    break;
                case "next":
                    controls.skipToNext();
                    Log.d(TAG, "Sent NEXT command");
                    break;
                case "previous":
                    controls.skipToPrevious();
                    Log.d(TAG, "Sent PREVIOUS command");
                    break;
                default:
                    call.reject("Unknown command: " + command);
                    return;
            }
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Command sent successfully");
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Error sending media command", e);
            call.reject("Failed to send command: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getPlaybackState(PluginCall call) {
        MediaController controller = getMediaController();
        JSObject ret = new JSObject();
        
        if (controller == null) {
            ret.put("isPlaying", false);
            call.resolve(ret);
            return;
        }

        try {
            PlaybackState state = controller.getPlaybackState();
            boolean isPlaying = state != null && 
                state.getState() == PlaybackState.STATE_PLAYING;
            
            ret.put("isPlaying", isPlaying);
            
            if (controller.getMetadata() != null) {
                String title = controller.getMetadata().getString(
                    android.media.MediaMetadata.METADATA_KEY_TITLE);
                String artist = controller.getMetadata().getString(
                    android.media.MediaMetadata.METADATA_KEY_ARTIST);
                long duration = controller.getMetadata().getLong(
                    android.media.MediaMetadata.METADATA_KEY_DURATION);
                
                if (title != null) ret.put("currentTrack", title);
                if (artist != null) ret.put("artist", artist);
                if (duration > 0) ret.put("duration", duration);
                
                if (state != null) {
                    ret.put("position", state.getPosition());
                }
            }
            
            call.resolve(ret);
            Log.d(TAG, "Playback state retrieved: " + isPlaying);
        } catch (Exception e) {
            Log.e(TAG, "Error getting playback state", e);
            ret.put("isPlaying", false);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void launchApp(PluginCall call) {
        try {
            Intent launchIntent = getContext().getPackageManager()
                .getLaunchIntentForPackage(LARK_PLAYER_PACKAGE);
            
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(launchIntent);
                
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", "Lark Player launched");
                call.resolve(ret);
                Log.d(TAG, "Lark Player launched successfully");
            } else {
                call.reject("Lark Player is not installed");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error launching Lark Player", e);
            call.reject("Failed to launch app: " + e.getMessage());
        }
    }

    @PluginMethod
    public void setVolume(PluginCall call) {
        Integer level = call.getInt("level");
        if (level == null) {
            call.reject("Volume level is required");
            return;
        }

        try {
            int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            int targetVolume = (int) ((level / 100.0) * maxVolume);
            
            audioManager.setStreamVolume(
                AudioManager.STREAM_MUSIC, 
                targetVolume, 
                AudioManager.FLAG_SHOW_UI
            );
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
            Log.d(TAG, "Volume set to: " + level + "%");
        } catch (Exception e) {
            Log.e(TAG, "Error setting volume", e);
            call.reject("Failed to set volume: " + e.getMessage());
        }
    }

    @PluginMethod
    public void adjustVolume(PluginCall call) {
        String direction = call.getString("direction");
        Integer amount = call.getInt("amount", 1);
        
        if (direction == null) {
            call.reject("Direction is required");
            return;
        }

        try {
            int adjustDirection = direction.equalsIgnoreCase("up") 
                ? AudioManager.ADJUST_RAISE 
                : AudioManager.ADJUST_LOWER;
            
            // Adjust volume multiple times based on amount
            for (int i = 0; i < amount; i++) {
                audioManager.adjustStreamVolume(
                    AudioManager.STREAM_MUSIC,
                    adjustDirection,
                    AudioManager.FLAG_SHOW_UI
                );
            }
            
            int currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
            int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            int volumePercent = (int) ((currentVolume / (float) maxVolume) * 100);
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("newLevel", volumePercent);
            call.resolve(ret);
            Log.d(TAG, "Volume adjusted " + direction + " to: " + volumePercent + "%");
        } catch (Exception e) {
            Log.e(TAG, "Error adjusting volume", e);
            call.reject("Failed to adjust volume: " + e.getMessage());
        }
    }

    private MediaController getMediaController() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            Log.w(TAG, "Media session control requires Android 5.0+");
            return null;
        }

        try {
            MediaSessionManager manager = (MediaSessionManager) 
                getContext().getSystemService(Context.MEDIA_SESSION_SERVICE);
            
            if (manager == null) {
                Log.w(TAG, "MediaSessionManager is null");
                return null;
            }

            // Try to get active sessions
            // Note: This requires BIND_NOTIFICATION_LISTENER_SERVICE permission
            List<MediaController> controllers = manager.getActiveSessions(
                new ComponentName(getContext(), NotificationListener.class)
            );
            
            // Find Lark Player's controller
            for (MediaController controller : controllers) {
                if (LARK_PLAYER_PACKAGE.equals(controller.getPackageName())) {
                    mediaController = controller;
                    Log.d(TAG, "Found Lark Player media controller");
                    return controller;
                }
            }
            
            Log.d(TAG, "Lark Player media controller not found");
        } catch (SecurityException e) {
            Log.e(TAG, "Permission denied for media session access", e);
        } catch (Exception e) {
            Log.e(TAG, "Error getting media controller", e);
        }
        
        return null;
    }
}
