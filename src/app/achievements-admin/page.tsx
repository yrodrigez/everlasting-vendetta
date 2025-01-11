// /.achievements-admin/Page
import createServerSession from "@utils/supabase/createServerSession";
import {cookies} from "next/headers";
import {ROLE} from "@utils/constants";
import {Achievement} from "@/app/types/Achievements";
import {Input, Textarea} from "@nextui-org/react";
import {revalidatePath} from "next/cache"
import {Button} from "@/app/components/Button";
import Image from "next/image";

const ALLOWED_ROLES = [ROLE.ADMIN]
export const dynamic = 'force-dynamic';

async function createAchievement(formData: FormData) {
	'use server'
	const {supabase} = await createServerSession({cookies});
	const name = formData.get('name') as string
	const description = formData.get('description') as string
	const points = formData.get('points') ?? 0 as number
	const condition = formData.get('condition') as string

	const {data: achievement, error} = await supabase.from('achievements')
	.insert({
		name,
		description,
		points,
		condition: JSON.parse(condition)
	})
	.select('id')
	.single()

	if (error || !achievement?.id) {
		console.error('Error creating achievement:', error)
		return
	}

	const imagePath = achievement.id
	const file = formData.get('img') as File
	const fileExtension = file?.name.split('.').pop()
	const fileName = `${imagePath}${fileExtension ? `.${fileExtension}` : ''}`
	if (file) {
		const {data: uploadData, error: uploadError} = await supabase.storage
		.from('achievement-image')
		.upload(fileName, file)

		if (uploadError) {
			console.error('Error uploading image:', uploadError)
			await supabase.from('achievements').delete().eq('id', achievement.id)
			return
		}

		const {data: {publicUrl}} = supabase.storage.from('achievement-image').getPublicUrl(uploadData.path)
		if (!publicUrl) {
			console.error('Error getting public url', publicUrl)
			await supabase.storage.from('achievement-image').remove([uploadData.path])
			await supabase.from('achievements').delete().eq('id', achievement.id)
			return
		}
		const {data: updateImage, error: updateError} = await supabase.from('achievements').update({img: publicUrl})
		.eq('id', achievement.id)
		.select('img')

		if (updateError || !updateImage) {
			console.error('Error updating image:', updateError)

			await supabase.storage.from('achievement-image').remove([uploadData.path])
			await supabase.from('achievements').delete().eq('id', achievement.id)
		}
	}

	revalidatePath('/achievements-admin')
}

export default async function Page({}: {}) {
	const {supabase, auth} = await createServerSession({cookies});
	const user = await auth.getSession();

	if (!user) {
		return (
			<div className={'flex flex-col items-center justify-center h-screen'}>
				<h1 className={'text-4xl'}>Not logged in</h1>
			</div>
		)
	}

	const isAllowed = user.roles.some(role => ALLOWED_ROLES.includes(role))

	if (!isAllowed) {
		return (
			<div className={'flex flex-col items-center justify-center h-screen'}>
				<h1 className={'text-4xl'}>Not authorized</h1>
			</div>
		)
	}

	const {data: achievements, error: achievementsError} = await supabase.from('achievements')
	.select('*')
	.returns<Achievement[]>();

	return (
		<div className="flex flex-col items-center justify-center w-full h-full overflow-auto">
			<div
				className={'grid grid-cols-1 w-full h-full gap-4 overflow-auto scrollbar-pill bg-dark border-dark-100 border'}>
				<h1 className={'text-xl self-start ml-6'}>Achievements</h1>
				<div className={'grid grid-cols-5 gap-4 w-full max-w-6xl p-4'}>
					{/* Header Row */}
					<div className={'col-span-full grid grid-cols-5 font-bold text-lg border-b pb-2'}>
						<div className={'col-span-1'}>Image</div>
						<div className={'col-span-1'}>Name</div>
						<div className={'col-span-1'}>Description</div>
						<div className={'col-span-1'}>Points</div>
						<div className={'col-span-1'}>Condition</div>
					</div>
					{/* Achievements Rows */}
					{achievements?.map(achievement => (
						<div
							key={achievement.id}
							className={'col-span-full grid grid-cols-5'}
						>
							<div className={'col-span-1'}>
								{achievement.img ? (
									<img
										src={achievement.img}
										alt={achievement.name}
										className={'rounded-full shadow-lg border border-gold border-opacity-50 w-14 h-14'}
									/>
								) : (
									<span className={'text-xs italic text-gray-500'}>No image</span>
								)}
							</div>
							<div className={'col-span-1 text-sm font-semibold'}>{achievement.name}</div>
							<div className={'col-span-1 text-sm text-gray-600'}>{achievement.description}</div>
							<div className={'col-span-1 text-sm font-semibold'}>{achievement.points}</div>
							<div className={'col-span-1'}>
								<div
									className={'text-xs p-1 bg-wood rounded border border-wood-100 scrollbar-pill overflow-auto text-default w-full h-full whitespace-pre'}>
									{JSON.stringify(achievement.condition, null, 2)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
			<div className={'flex flex-col items-center justify-center w-full h-full gap-4 border-t border-gold'}>
				<h1 className={'text-xl self-start ml-6'}>Create Achievement</h1>
				<form className={'flex flex-col gap-4 w-full max-w-lg p-4 shadow-lg'} action={createAchievement}>
					<Input label={'Name'}
					       isRequired
					       name={'name'}
					/>
					<Input label={'Description'}
					       isRequired
					       name={'description'}/>
					<Input label={'Points'}
					       isRequired
					       type={'number'}
					       name={'points'}/>
					<Input
						accept={'image/*'}
						type="file"
						label={'Icon'}
						name={'img'}/>
					<Textarea label="Condition"
					          name={'condition'}
					          isRequired/>
					<div className={'flex gap-4 w-full justify-between'}>
						<Button
							className={'w-full bg-red-600 border border-red-500 text-white'}
							type="reset"
						>
							Clear
						</Button>
						<Button
							className={'w-full'}

							type="submit"
						>
							Create
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
