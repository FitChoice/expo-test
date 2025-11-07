import { Button, Icon } from '@/shared/ui'
import { CloseBtnProps } from '@/shared/ui/CloseBtn/types'

export const CloseBtn = ({
	handlePress, classNames
												 }: CloseBtnProps) => {
	return 	<Button variant="ghost" onPress={handlePress} className={classNames}>
		<Icon name="close" size={24} color="#FFFFFF" />
	</Button>
}