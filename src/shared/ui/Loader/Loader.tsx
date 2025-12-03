import { ActivityIndicator, View, Text } from 'react-native'

import React from 'react'
import { BackgroundLayoutNoSidePadding } from '@/shared/ui'

export const Loader = ({ text = 'Пожалуйста подождите' }: {text?: string}) => <BackgroundLayoutNoSidePadding>
    <View className="flex-1 items-center justify-center gap-10">
        {text &&   <Text className="text-h2 text-light-text-100 mb-2 text-center">
            {text}
        </Text>}
        <ActivityIndicator size="large" color="#9333EA" />
    </View>
</BackgroundLayoutNoSidePadding>
