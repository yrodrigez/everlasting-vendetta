'use client'
import {Button} from "@/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";

export default function DeleteAchievementButton() {
	return (
		<Button
			size="sm"
			onPress={() => {
				if (!confirm('Are you sure you want to delete this achievement?')) {
					return;
				}
			}}
			type="submit"
			isIconOnly
			aria-label="Delete achievement"
			className={'bg-red-600 border border-red-500 text-white'}>
			<FontAwesomeIcon icon={faTrash}/>
		</Button>
	)
}
