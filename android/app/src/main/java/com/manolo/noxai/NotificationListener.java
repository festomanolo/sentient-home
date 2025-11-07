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

// [NOX-DEV-90]: ongoing module refinement
