# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# AutoValue and JavaPoet
-keep class javax.lang.model.** { *; }
-keep class javax.tools.** { *; }
-keep class autovalue.shaded.com.squareup.javapoet.** { *; }
-keep class com.google.auto.value.** { *; }
-keep class com.google.auto.value.extension.memoized.** { *; }
-dontwarn javax.lang.model.**
-dontwarn javax.tools.**
-dontwarn autovalue.shaded.com.squareup.javapoet.**
-dontwarn com.google.auto.value.**

# Add any project specific keep options here:
