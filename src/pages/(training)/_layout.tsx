/**
 * Layout для группы роутов training
 */

import { Stack } from 'expo-router'

export default function TrainingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="[trainingId]" /> {/* ВАЖНО: добавь этот экран */}
            <Stack.Screen name="session" />
            <Stack.Screen name="report" />
        </Stack>
    )
}
