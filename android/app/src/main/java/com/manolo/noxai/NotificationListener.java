package com.manolo.noxai;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

/**
 * NotificationListenerService required for accessing MediaSession information
 * This service must be declared in AndroidManifest.xml and enabled by the user
 */
public class NotificationListener extends NotificationListenerService {
    private static final String TAG = "NotificationListener";

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "NotificationListener service created");
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        // We don't need to handle notifications, just need the service for MediaSession access
        Log.d(TAG, "Notification posted: " + sbn.getPackageName());
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // We don't need to handle notifications, just need the service for MediaSession access
        Log.d(TAG, "Notification removed: " + sbn.getPackageName());
    }

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        Log.d(TAG, "NotificationListener connected");
    }

    @Override
    public void onListenerDisconnected() {
        super.onListenerDisconnected();
        Log.d(TAG, "NotificationListener disconnected");
    }
}
