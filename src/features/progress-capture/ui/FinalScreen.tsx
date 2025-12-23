import type { ProgressSide, TempCapturedPhoto } from '@/entities/progress'
import { BackgroundLayoutNoSidePadding, Button, Icon } from '@/shared/ui'
import {
	Image,
	Pressable,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { sideTitle } from '@/shared/constants/labels'
import React from 'react'
import { lightFormat } from 'date-fns'
import {
	BackgroundLayoutSafeArea
} from '@/shared/ui/BackgroundLayout/BackgroundLayoutSafeArea'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

export const FinalScreen = ({
											 items,
											 onSave,
											 onRestart,
											 saveToGallery,
											 onToggleSaveToGallery,
											 isSaving,
										 }: {
	items: TempCapturedPhoto[]
	onSave: () => void
	onRestart: (side: ProgressSide) => void
	saveToGallery: boolean
	onToggleSaveToGallery: () => void
	isSaving: boolean
}) => (
	<BackgroundLayoutSafeArea needBg={false}>

			<View className="mb-10" >
				<Text className="text-t1.1 text-light-text-100 text-center">{lightFormat(new Date(), 'dd.MM.yyyy')}</Text>
			</View>

			<View className="flex-row flex-wrap gap-3  flex-1">
				{items.map((item, idx) => (
					<View className={`w-[48%] h-[260px] mb-${idx == 0 || idx == 1 ? 20 : 0}`} >
						<View className="py-2 px-4 rounded-3xl bg-[#454545]/70 mb-2" >
							<Text className=" text-t4 text-light-text-100">
								{sideTitle[item.side]}
							</Text>
						</View>
						<View
							key={`${item.side}-${item.tempUri}`}
							className=" overflow-hidden rounded-2xl border border-[#2a2a2a] position-relative"
						>

							<View className="absolute -right-3 -top-3  z-10">

								<TouchableOpacity
									onPress={() => onRestart(item.side)}
									className={'absolute right-4 top-5 h-12 w-12 items-center justify-center bg-white/30 rounded-2xl'}
								>
									<FontAwesome6 name="arrow-rotate-left" size={20} color="white" />
								</TouchableOpacity>
							</View>
							<Image source={{ uri: item.tempUri }} className="w-full h-full" resizeMode="cover" />
						</View>
					</View>
				))}
			</View>

			<Button className="" onPress={onSave} disabled={isSaving || items.length < 4}>
				{isSaving ? 'Сохраняем...' : items.length < 4 ? 'Сделайте 4 снимка' : 'Сохранить'}
			</Button>
			{/*<Button variant="ghost" onPress={onRestart} disabled={isSaving}>*/}
			{/*	Начать заново*/}
			{/*</Button>*/}




	</BackgroundLayoutSafeArea>
)