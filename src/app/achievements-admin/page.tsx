// /.achievements-admin/Page
import createServerSession from "@utils/supabase/createServerSession";
import {cookies} from "next/headers";
import {ROLE} from "@utils/constants";
import {Achievement, AchievementCondition} from "@/app/types/Achievements";
import {Input, Textarea} from "@nextui-org/react";
import {revalidatePath} from "next/cache"
import {redirect} from "next/navigation";
import {Button} from "@/app/components/Button";
import {ConditionEditor} from "@/app/achievements-admin/ConditionEditor";
import DeleteAchievementButton from "@/app/achievements-admin/DeleteAchievementButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencil} from "@fortawesome/free-solid-svg-icons";
import {SupabaseClient} from "@supabase/supabase-js";

const ALLOWED_ROLES = [ROLE.ADMIN]
export const dynamic = 'force-dynamic';

function createOrUpdateAchievement(supabase: SupabaseClient, achievement: Achievement) {
	if (achievement.id) {
		return supabase.from('achievements')
		.update(achievement)
		.eq('id', achievement.id)
		.select('id')
		.maybeSingle()
	} else {
		return supabase.from('achievements')
		.insert(achievement)
		.select('id')
		.maybeSingle()
	}
}

function createOrUpdateImage(supabase: SupabaseClient, achievement: Achievement, file: File) {
	const imagePath = achievement.id
	const fileExtension = file.name.split('.').pop()
	const fileName = `${imagePath}${fileExtension ? `.${fileExtension}` : ''}`
	return supabase.storage
	.from('achievement-image')
	.upload(fileName, file)
}

async function updateAchievementImage(supabase: SupabaseClient, achievement: Achievement, file: File) {
	if (!achievement.id) return {error: 'No achievement id provided'}
	const {data: {publicUrl}} = supabase.storage.from('achievement-image').getPublicUrl(achievement.id)
	if (!publicUrl) {
		console.error('Error getting public url', publicUrl)
		return {error: 'Error getting public url'}
	}

	return supabase.from('achievements').update({img: publicUrl})
	.eq('id', achievement.id)
}

async function createAchievement(formData: FormData) {
	'use server'
	const {supabase} = await createServerSession({cookies});
	const name = formData.get('name') as string
	const description = formData.get('description') as string
	const points = formData.get('points') ?? 0 as number
	const condition = formData.get('condition') as string
	const category = formData.get('category') as string

	const {data: achievement, error} = await supabase.from('achievements')
	.insert({
		name,
		description,
		points,
		category,
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

async function deleteAchievement(formData: FormData) {
	'use server'
	const {supabase} = await createServerSession({cookies});
	const id = formData.get('id') as string
	if (!id) {
		console.error('No id provided')
		return
	}
	const {data, error} = await supabase.from('achievements')
	.delete()
	.eq('id', id)
	.single()

	if (error) {
		console.error('Error deleting achievement:', error)
		return
	}


	const {error: removeError} = await supabase.storage.from('achievement-image').remove([id])
	if (removeError) {
		console.error('Error removing image:', removeError)
	}

	revalidatePath('/achievements-admin')
}

async function redirectToEdit(formData: FormData) {
	'use server'
	return
	const id = formData.get('id') as string
	console.log('Edit achievement:', id)
	if (!id) {
		console.error('No id provided')
		return
	}
	redirect(`/achievements-admin?edit=${id}`)
}


export default async function Page({searchParams}: {
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
	const {supabase, auth} = await createServerSession({cookies});
	const user = await auth.getSession();

	const id = (await searchParams)?.edit as string | undefined

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
	.order('created_at', {ascending: false})
	.returns<Achievement[]>();
	let achievement = null
	if (id) {
		achievement = achievements?.find(achievement => achievement.id === id)
		if (!achievement) {
			return (
				<div className={'flex flex-col items-center justify-center h-screen'}>
					<h1 className={'text-4xl'}>Achievement not found</h1>
				</div>
			)
		}
	}

	return (
		<div className="flex flex-col items-center justify-center w-full h-full overflow-auto">
			<div
				className={'grid grid-cols-1 w-full h-full gap-4 overflow-auto scrollbar-pill bg-dark border-dark-100 border'}>
				<h1 className={'text-xl self-start ml-6'}>Achievements</h1>
				<div className={'grid grid-cols-6 gap-4 w-full p-4'}>
					<div className={'col-span-full grid grid-cols-6 font-bold text-lg border-b pb-2'}>
						<div className={'col-span-1'}>Image</div>
						<div className={'col-span-1'}>Name</div>
						<div className={'col-span-1'}>Description</div>
						<div className={'col-span-1'}>Points</div>
						<div className={'col-span-1'}>Condition</div>
						<div className={'col-span-1'}>Actions</div>
					</div>
					{/* Achievements Rows */}
					{achievements?.map(achievement => (
						<div
							key={achievement.id}
							id={achievement.id}
							className={'col-span-full grid grid-cols-6'}
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
							<div className={'col-span-1 text-sm'}>{achievement.description}</div>
							<div className={'col-span-1 text-sm font-semibold'}>{achievement.points}</div>
							<div className={'col-span-1'}>
								<div
									className={'text-xs p-1 bg-wood rounded border border-wood-100 scrollbar-pill overflow-auto text-default w-full h-full whitespace-pre'}>
									{JSON.stringify(achievement.condition, null, 2)}
								</div>
							</div>
							<div className={'col-span-1 flex gap-2 items-center justify-center'}>
								<form action={redirectToEdit}>
									<input type={'hidden'} name={'id'} value={achievement.id}/>
									<Button size="sm" isIconOnly type="submit">
										<FontAwesomeIcon icon={faPencil}/>
									</Button>
								</form>
								<form action={deleteAchievement}>
									<input  type={'hidden'} name={'id'} value={achievement.id}/>
									<DeleteAchievementButton/>
								</form>
							</div>
						</div>
					))}
				</div>
			</div>
			<div className={'flex flex-col items-center justify-center w-full h-full gap-4 border-t border-gold'}>
				<h1 className={'text-xl self-start ml-6'}>Create Achievement</h1>
				<form className={'flex flex-col gap-4 w-full p-4'} action={createAchievement}>
					<div
						className={'flex gap-2 w-full'}>
						<div
							className={'w-full flex flex-col gap-2 max-w-sm'}>
							<Input
								value={achievement?.name}
								label={'Name'}
								isRequired
								name={'name'}
							/>
							<Input
								value={achievement?.description}
								label={'Description'}
								isRequired
								name={'description'}/>
							<Input
								label={'Points'}
								isRequired
								type={'number'}
								name={'points'}/>
							<Input
								value={achievement?.category}
								label={'Category'}
								isRequired
								type={'text'}
								name={'category'}/>
							<Input
								accept={'image/*'}
								type="file"
								label={'Icon'}
								name={'img'}/>
						</div>
						<div
							className={'w-full flex flex-col gap-2'}>
							<ConditionEditor
								code={achievement ? JSON.stringify(achievement?.condition ?? '', null, 2) : undefined}
								name={'condition'}
							/>

						</div>
					</div>
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
							{achievement ? 'Update' : 'Create'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
