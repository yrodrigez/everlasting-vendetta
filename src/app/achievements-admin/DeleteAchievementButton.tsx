'use client'
import {Button} from "@/app/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";

export default function DeleteAchievementButton() {
	return (
		<Button
			size="sm"
			onClick={(e) => {
				if (!confirm('Are you sure you want to delete this achievement?')) {
					e.preventDefault();
				}
			}}
			type="submit"
			isIconOnly
			className={'bg-red-600 border border-red-500 text-white'}>
			<FontAwesomeIcon icon={faTrash}/>
		</Button>
	)
}
