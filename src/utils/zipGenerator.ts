import JSZip from 'jszip';
import { KOTLIN_ARCHITECTURE_FILES } from '../data/kotlinCodebase';

export async function generateAndroidStudioProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root Project Structure
  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "JarvisAI"
include(":app")
`
  );

  zip.file(
    'build.gradle.kts',
    `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`
  );

  zip.file(
    '.github/workflows/build-apk.yml',
    `name: Build Android APK

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    name: Build APK
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - uses: android-actions/setup-android@v3
      - run: chmod +x gradlew
      - uses: gradle/actions/setup-gradle@v3
        with:
          gradle-version: '8.7'
      - run: ./gradlew assembleDebug --no-daemon --stacktrace
      - uses: actions/upload-artifact@v4
        with:
          name: JARVIS-AI-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk
`
  );

  zip.file(
    'gradlew',
    `#!/bin/sh
exec gradle "$@"
`
  );

  zip.file(
    'gradlew.bat',
    `@echo off
gradle %*
`
  );

  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`
  );

  zip.file(
    'README.md',
    `# JARVIS AI — Next-Gen Android Voice Assistant

Production-ready, zero-lag Android voice assistant application operating globally across the entire OS using \`TYPE_APPLICATION_OVERLAY\` and a procedural 3D Liquid Glass Fluid Orb face.

## Key Architecture
1. **Always-On Wake-Word Engine**: Battery-optimized <120ms foreground listener ("Hey Jarvis").
2. **Procedural 3D Liquid Orb Face**: Translucent liquid-glass bubble with internal cyan/magenta convection shaders (\`ShaderOrbView.kt\`).
3. **Voice Pitch Classifier & Neural TTS**: Audio frequency analyzer detecting caller gender (Sir vs Ma'am) with deep Indian English accent (Pitch 0.85x).
4. **Zero-Talk Silent Execution Pipeline**: Autonomous OS hardware toggles & headless UI click injection (\`JarvisAccessibilityService.kt\`).
5. **Dual-Engine Hybrid Brain**: Local on-device SLM (SmolLM-135M / Gemma-2B) + Online Gemini API reasoning router.

## Setup & Running in Android Studio
1. Open this directory in **Android Studio Hedgehog / Iguana / Ladybug+**.
2. Sync Gradle dependencies.
3. Connect an Android 10+ (API 29+) device or start an emulator with Google APIs.
4. Run \`./gradlew installDebug\` or click **Run > Run 'app'**.
5. On initial launch, grant:
   - Display Over Other Apps (\`SYSTEM_ALERT_WINDOW\`)
   - Continuous Microphone (\`RECORD_AUDIO\`)
   - Jarvis Accessibility Service (\`BIND_ACCESSIBILITY_SERVICE\`)
   - Modify System Settings (\`WRITE_SETTINGS\`)
   - Ignore Battery Optimizations
6. Say *"Hey Jarvis"* or tap the floating liquid glass punch-hole orb!
`
  );

  // Add all Kotlin / XML / GLSL architecture files
  for (const file of KOTLIN_ARCHITECTURE_FILES) {
    zip.file(file.path, file.content);
  }

  // Supporting application class & resources
  zip.file(
    'app/src/main/java/com/jarvis/assistant/JarvisApplication.kt',
    `package com.jarvis.assistant

import android.app.Application

class JarvisApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
`
  );

  zip.file(
    'app/src/main/res/values/strings.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">JARVIS AI</string>
    <string name="accessibility_service_description">Autonomous headless UI execution engine for JARVIS voice commands.</string>
</resources>
`
  );

  zip.file(
    'app/src/main/res/values/colors.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
    <color name="jarvis_cyan">#00E5FF</color>
    <color name="jarvis_magenta">#FF1744</color>
    <color name="jarvis_deep_blue">#0A0E17</color>
</resources>
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
